import hCaptchaPlugin from '@cloudflare/pages-plugin-hcaptcha';
import { KVNamespace } from '@cloudflare/workers-types';

interface Env {
    HCAPTCHA_SECRET: string;
    HCAPTCHA_SITE_KEY: string;
    AUTHORIZED_CONTACTS: KVNamespace;
}

export async function onRequestPost(context) {
    const { env, request } = context;
    hCaptchaPlugin({
        secret: env.HCAPTCHA_SECRET,
        sitekey: env.HCAPTCHA_SITE_KEY
    }),
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

            const formData = await request.formData();

            return await checkRepresentative(formData, env.AUTHORIZED_CONTACTS);
        } catch (error) {
            return new Response(JSON.stringify({
                message: `Error processing the form.`,
            }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            });
        }
    }
}

const checkRepresentative = async (formData: FormData, kvNamespace: KVNamespace): Promise<Response> => {
    const type = formData.get('type')?.toString().trim().toLowerCase();
    let username = formData.get('username')?.toString().trim().toLowerCase();

    if (!type || !username) {
        return new Response(JSON.stringify({
            message: `Invalid form data.`,
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
                message: `User: '${representative}' is an official representative under this contact.`,
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });
        } else {
            return new Response(JSON.stringify({
                message: `This contact is not authorized as an official contact!`,
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });
        }
    } catch (error) {
        return new Response(JSON.stringify({
            message: `Error searching for the data.`,
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
