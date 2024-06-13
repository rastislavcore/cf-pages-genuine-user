import hcaptchaVerify from '@cloudflare/pages-plugin-hcaptcha';
import { KVNamespace } from '@cloudflare/workers-types';

interface Env {
    HCAPTCHA_SECRET: string;
    HCAPTCHA_SITE_KEY: string;
}

declare const KV_NAMESPACE: KVNamespace;

export async function onRequestPost(context) {
    const { env, request } = context;
    try {
        // Update hcaptcha configuration with the environment variables
        /*const hcaptchaConfig = hcaptchaVerify({
            secret: env.HCAPTCHA_SECRET,
            sitekey: env.HCAPTCHA_SITE_KEY,
        });

        // Run hcaptcha verification first
        const hcaptchaResponse = await hcaptchaConfig(context);
        if (hcaptchaResponse) {
            console.warn('hCaptcha verification failed');
            return new Response(JSON.stringify({
                message: hcaptchaResponse,
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }*/

        console.log('Handling POST request');
        const contentType = request.headers.get('content-type');
        console.log('Content-Type:', contentType);

        if (!contentType || !contentType.includes('multipart/form-data')) {
            console.log('Unsupported Media Type');
            return new Response('Unsupported Media Type', { status: 415 });
        }

        const formData = await request.formData();
        const type = formData.get('type');
        const username = formData.get('username');
        const gRecaptchaResponse = formData.get('g-recaptcha-response');
        const hCaptchaResponse = formData.get('h-captcha-response');

        console.log('Form Data:', { type, username, gRecaptchaResponse, hCaptchaResponse });

        if (!type || !username || !gRecaptchaResponse || !hCaptchaResponse) {
            console.log('Missing fields in form data');
            return new Response('Missing fields', { status: 400 });
        }

        // Process the form data as needed
        return new Response('Form submitted successfully', { status: 200 });
    } catch (error) {
        console.error('Error processing form:', (error as Error).message);
        return new Response(`Error processing form: ${(error as Error).message}`, { status: 500 });
    }
}

const checkRepresentative = async (formData: FormData): Promise<Response> => {
    const type = formData.get('type')?.toString().trim().toLowerCase();
    let username = formData.get('username')?.toString().trim().toLowerCase();

    if (!type || !username) {
        console.error('Invalid form data');
        return new Response(JSON.stringify({
            message: `Invalid form data`,
        }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    // Normalize the username
    username = username.replace(/^[@+]/, '');

    // Create the key
    const key = `${type}:${username}`;
    console.log(`Looking up KV for key: ${key}`);
    const representative = await KV_NAMESPACE.get(key);

    if (representative) {
        console.log(`User found: ${representative}`);
        return new Response(JSON.stringify({
            message: `User: '${representative}' is an official representative under this contact.`,
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } else {
        console.warn('User not found');
        return new Response(JSON.stringify({
            message: `This contact is not authorized as an official contact!`,
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
