# Cloudflare Pages with Static Forms and hCaptcha

This project demonstrates how to create a serverless function on Cloudflare Pages using static forms and hCaptcha verification. The form allows users to verify their contact information, and the data is stored in a Cloudflare KV Namespace.

## Setup

### Prerequisites

1. **Node.js** and **npm** installed on your machine.
2. A **Cloudflare** account.
3. **Cloudflare Workers** and **KV Namespace** set up.
4. **hCaptcha** account for obtaining the secret and site key.

### Environment Variables

Create a `.env` file in the root of your project and add the following environment variables:

```sh
HCAPTCHA_SECRET=<your-hcaptcha-secret-key>
HCAPTCHA_SITE_KEY=<your-hcaptcha-site-key>
KV_NAMESPACE_ID=<your-kv-namespace-id>
```

### Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/rastislavcore/cf-pages-genuine-user.git
    cd cf-pages-genuine-user
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

3. Deploy to Cloudflare Pages:

    ```bash
    npx wrangler publish
    ```

## Usage

### Form HTML

Use the following HTML for your form. Place this in an HTML file that you serve from your Cloudflare Pages site.

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verification Form</title>
</head>
<body>
    <h1>Verify Us</h1>
    <form id="verify-form" data-static-form-name="verify-person">
        <label for="type">Contact Type:</label>
        <select id="type" name="type" required>
            <option value="email" selected>E-mail</option>
            <option value="telegram">Telegram</option>
            <option value="x">X (Twitter)</option>
            <option value="discord">Discord</option>
            <option value="linkedin">LinkedIn</option>
            <option value="coretalk">CoreTalk</option>
            <option value="github">GitHub</option>
        </select>
        <br>
        <label for="username">Contact name:</label>
        <input type="text" id="username" name="username" required>
        <br>
        <div class="h-captcha"></div>
        <br>
        <button type="submit">Verify</button>
    </form>
    <script src="https://hcaptcha.com/1/api.js" async defer></script>
</body>
</html>
```

## License

This project is licensed under the Core License.
