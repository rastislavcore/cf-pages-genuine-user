import hCaptchaPlugin from '@cloudflare/pages-plugin-hcaptcha';
import { KVNamespace, PagesFunction } from '@cloudflare/workers-types';

interface Env {
	HCAPTCHA_SECRET: string;
	HCAPTCHA_SITE_KEY: string;
	AUTHORIZED_CONTACTS: KVNamespace;
}

const checkRepresentative = async (formData: FormData, kvNamespace: KVNamespace): Promise<Response> => {
	const type = (formData.get('type') as string)?.trim().toLowerCase();
	let username = (formData.get('username') as string)?.trim().toLowerCase();

	if (!type || !username) {
		return new Response(JSON.stringify({
			message: `Invalid form data. Make sure both fields are filled.`,
		}), {
			status: 400,
			headers: { 'Content-Type': 'application/json' },
		});
	}

	// Normalize the username
	username = username.replace(/^[@+]/, '');

	// Create the key
	const key = `${type}:${username}`;
	const representative = await kvNamespace.get(key);

	try {
		if (representative) {
			return new Response(JSON.stringify({
				message: `Our system successfully verified the contact information you provided. '${representative}' is a genuine team member, and you may freely continue communicating with them. `,
				valid: true,
			}), {
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			});
		} else {
			return new Response(JSON.stringify({
				message: `Our system could not verify the contact information you provided. This may not be an official representative, and we advise you to cease communication with this account at once to protect the safety of your assets and your account.`,
			}), {
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			});
		}
	} catch (error) {
		return new Response(JSON.stringify({
			message: `Error searching for the data. Please contact our support department.`,
		}), {
			status: 500,
			headers: { 'Content-Type': 'application/json' },
		});
	}
}

export const onRequestPost: PagesFunction<Env>[] = [
	async (context) => {
		const { env, request } = context;
		try {
			const response = await hCaptchaPlugin({
				secret: env.HCAPTCHA_SECRET,
				sitekey: env.HCAPTCHA_SITE_KEY,
			})(context);

			if (!response.ok) {
				const text = await response.text();
				return new Response(JSON.stringify({
					message: `Captcha verification failed.`,
					details: text
				}), {
					status: response.status,
					headers: { 'Content-Type': 'application/json' },
				});
			}

			return response;
		} catch (error) {
			return new Response(JSON.stringify({
				message: `Captcha verification failed.`,
				error: error.message
			}), {
				status: 400,
				headers: { 'Content-Type': 'application/json' },
			});
		}
	},
	async (context) => {
		const { env, request } = context;
		try {
			const contentType = request.headers.get('content-type');
			if (!contentType || !contentType.includes('multipart/form-data')) {
				return new Response(JSON.stringify({
					message: `Unsupported Media Type.`,
				}), {
					status: 415,
					headers: { 'Content-Type': 'application/json' },
				});
			}

			const formData = await request.formData() as FormData;
			return await checkRepresentative(formData, env.AUTHORIZED_CONTACTS);
		} catch (error) {
			return new Response(JSON.stringify({
				message: `Error processing your request. Please refresh the page and try again.`,
				error: error.message
			}), {
				status: 500,
				headers: { 'Content-Type': 'application/json' },
			});
		}
	}
];
