import hcaptchaVerify from '@cloudflare/pages-plugin-hcaptcha';
import createStaticFormsPlugin from '@cloudflare/pages-plugin-static-forms';
import { PagesFunction, KVNamespace } from '@cloudflare/workers-types';

interface Env {
    HCAPTCHA_SECRET: string;
    HCAPTCHA_SITE_KEY: string;
}

declare const KV_NAMESPACE: KVNamespace;

// Static forms plugin
const staticForms = createStaticFormsPlugin({
    respondWith: async ({ formData, name }: { formData: FormData, name: string }) => {
        console.log(`Received form: ${name}`);
        switch (name) {
            case 'verify-person':
                console.log('Checking representative');
                return await checkRepresentative(formData);
            default:
                console.error('Invalid form name');
                return new Response(JSON.stringify({
                    message: `Invalid form name`,
                }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' },
                });
        }
    },
});

// Function to check representative
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

// Combine both middlewares into a single PagesFunction
export const onRequestPost: PagesFunction<Env> = async (context) => {
    const { env, request } = context;

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

    // If hcaptcha verification passes, run the static forms plugin
    return staticForms(context);
};
