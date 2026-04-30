# Instagram Integration Guide

This package contains everything needed to add a "Connect with Our Story" Instagram feed to your website, similar to the one on the Krushika website.

## Package Contents

1.  **instagram_config.json**: Configuration file for credentials and settings.
2.  **instagram_lib.php**: Core PHP logic to fetch and cache posts.
3.  **instagram_feed.css**: Styling for the feed (Cards, Grid, Video support).
4.  **instagram_template.php**: HTML/PHP snippet to display the feed.

---

## 🛑 Instructions for Humans

### 1. Setup Files

Place the files in your project directory. We recommend the following structure:

```
project_root/
├── instagram_config.json    <-- Edit this!
├── includes/
│   └── instagram_lib.php    <-- Core Logic
├── assets/
│   └── css/
│       └── instagram_feed.css
└── your_page.php            <-- File where you want the feed
```

### 2. Get Your Credentials

You need an **Instagram User Access Token**.

1.  Go to [Meta for Developers](https://developers.facebook.com/).
2.  Create an App (Type: Consumer or Business).
3.  Add "Instagram Basic Display" product.
4.  Add your Instagram Tester account to the app and Accept the invite in Instagram Settings > Apps and Websites.
5.  Generate a **User Token** from the User Token Generator in the Developer Portal.
    - _Note: These tokens expire. For permanent tokens, you need a backend service to refresh them, but for simple static sites, regenerating this every 60 days is the standard manual method._

### 3. Configure

Open `instagram_config.json` and fill in your details:

- `access_token`: Paste the long string starting with `IG...`
- `primary_hashtag`: (Optional) Filter posts by this hashtag. e.g. `#MyProject`
- `cache_duration`: Time in seconds to cache the API response (3600 = 1 hour).

---

## 🤖 Instructions for Antigravity

If you are using Antigravity to build your site, simply **fill out the config file first**, and then paste the following prompt into your chat with Antigravity.

### Copy & Paste this Prompt:

```text
I have set up the `instagram_config.json` file with the required credentials.

Please implement the Instagram Feed on the [Target Page, e.g., index.php] following the standard implementation in the `InstagramPackage`.

Here is the plan:
1.  Ensure `includes/instagram_lib.php` is present and correctly referenced.
2.  Ensure `assets/css/instagram_feed.css` is linked in the `<head>` of the page.
3.  Insert the Instagram Section into the page content. You should use the logic found in `instagram_template.php`.
    -   Title: "Connect with Our Story" (or similar)
    -   Description: "Follow @[Handle] for updates..."
    -   Fetch 4 posts.
    -   Ensure the PHP logic loads the config correctly.

Use the provided files in the `InstagramPackage` as the source of truth for the code.
```

---

## Technical Notes

- **Caching**: The system creates a `cache/` folder automatically. Ensure your server has write permissions.
- **Images**: The system downloads images to `assets/img/ig/` automatically for better SEO and performance. Ensure write permissions.
- **CSS**: The provided CSS uses CSS Grid and Flexbox. It includes a `night-mode` compatible structure if your site supports it.
