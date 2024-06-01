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
6. Fill in Namespace Name as `KV_NAMESPACE` and click "Add".
7. Now you can add the entries.

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

## Usage

### Form HTML

Use the following HTML for your form. Place this in an HTML file that you serve from your Cloudflare Pages site.

```html
<form id="verify-form" data-static-form-name="verify-person">
    <select id="type" name="type" required>
        …
    </select>
    <input type="text" id="username" name="username" pattern="[a-zA-Z0-9%_@\.+-]+" required />
    <div class="h-captcha" data-sitekey="your_site_key"></div>
    <button type="submit">Verify</button>
</form>
<script src="https://hcaptcha.com/1/api.js" async defer></script>
```

## License

This project is licensed under the Core License.
