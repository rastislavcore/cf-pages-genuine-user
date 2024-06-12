import { Request } from '@cloudflare/workers-types';

export async function onRequestPost({ request }: { request: Request }) {
  try {
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

export async function onRequest({ request }: { request: Request }) {
  console.log('Received request:', request.method);
  if (request.method === 'POST') {
    return onRequestPost({ request });
  }
  return new Response('Method Not Allowed', { status: 405 });
}
