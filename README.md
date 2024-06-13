# Cloudflare Pages with Static Forms and hCaptcha

This project demonstrates how to create a serverless function on Cloudflare Pages using static forms and hCaptcha verification. The form allows users to verify their contact information, and the data is stored in a Cloudflare KV Namespace.

## Setup

### Prerequisites

1. **Node.js** and **npm** installed on your machine.
2. A **Cloudflare** account.
3. **Cloudflare Workers** and **KV Namespace** set up.
4. **hCaptcha** account for obtaining the secret and site key.

### Dependencies

This project requires two libraries:

- [@cloudflare/pages-plugin-static-forms](https://www.npmjs.com/package/@cloudflare/pages-plugin-static-forms)
- [@cloudflare/pages-plugin-hcaptcha](https://www.npmjs.com/package/@cloudflare/pages-plugin-hcaptcha)

Make sure install them or include them in your project.

Installation:

```sh
npm i @cloudflare/pages-plugin-static-forms @cloudflare/pages-plugin-hcaptcha
```

### Environment Variables

Create a `.env` file in the root of your project and add the following environment variables:

```sh
HCAPTCHA_SECRET=<your-hcaptcha-secret-key>
HCAPTCHA_SITE_KEY=<your-hcaptcha-site-key>
```

### Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/rastislavcore/cf-pages-genuine-user.git
    cd cf-pages-genuine-user
    ```

2. Install dependencies:

    ```bash
    npm i
    ```

3. Deploy to Cloudflare Pages:

    ```bash
    npx wrangler publish
    ```

### Key-Value (KV) Storage

Set up KV storage and binding for the system in read-only mode.

#### Set KV namespace bindings

1. Open CLoudflare Dashboard - Workers & Pages - Your deployed page.
2. Go to project Settings - Functions tab.
3. Scroll down to KV namespace bindings.
4. Click on "Get started" button.
5. Click on "Create a namespace" button.
6. Fill in Namespace Name as `AUTHORIZED_CONTACTS` and click "Add".
7. Now you can add the entries.

Read more [here](https://developers.cloudflare.com/pages/functions/bindings/#kv-namespaces).

#### Database structure

Key | Value
--- | ---
type:username | representative

- **type**: The provider type in lowercase characters.
- **username**: The username of the representative in lowercase characters, with the first character `@` or `+` trimmed.
- **representative**: The public name of representative for the requester. Output example: `User: '${representative}' is an official representative under this contact.`

## Building

If you would like build JavaScript file, you can use command:

```sh
npm i && npm build
```

If you need just Typescript file, installing required libraries is enough:

```sh
npm i
```

## API

API structure:

Endpoint | Version | Action
--- | --- | ---
/api | /1 | /verify

You can customize the path simply changing the structure in the `/functions` folder and changing `action` in the form.

## Usage

### Form HTML

Use the following HTML for your form. Place this in an HTML file that you serve from your Cloudflare Pages site.

```html
<form id="verify-form" data-static-form-name="verify-person" method="post" action="/api/1/verify">
    <select id="type" name="type" required>
        …
    </select>
    <input type="text" id="username" name="username" pattern="[a-zA-Z0-9%_@.+\-]+" title="Insert valid username without any prefixes or suffixes." required />
    <div class="h-captcha" data-sitekey="your_site_key"></div>
    <script src="https://hcaptcha.com/1/api.js" async defer></script>
    <button type="submit">Verify</button>
</form>
```

And script for showing the result:

```html
<div id="response-message"></div>

<script>
    document.getElementById('verify-form').addEventListener('submit', async (event) => {
        event.preventDefault();

        const form = event.target;
        const formData = new FormData(form);

        try {
            const response = await fetch(form.action, {
                method: form.method,
                body: formData
            });

            const messageDiv = document.getElementById('response-message');
            if (response.ok) {
                const result = await response.json();
                messageDiv.textContent = result.message;
            } else {
                const errorText = await response.text();
                messageDiv.textContent = `Error: ${errorText}`;
            }
        } catch (error) {
            document.getElementById('response-message').textContent = `Error: ${error.message}`;
        }
    });
</script>
```

## License

This project is licensed under the Core License.
