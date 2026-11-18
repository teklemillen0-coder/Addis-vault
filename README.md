# Addis-Vault

Addis-Vault is a public Ethiopian digital marketplace and AI app-building workspace. The
application is built with React, TypeScript, TanStack Start, and Vite.

## Run locally

Requirements: Node.js and npm.

```sh
npm install
npm run dev
```

Create a production build with:

```sh
npm run build
```

## Android APK

The Capacitor Android app loads `https://workers.dev` and uses Android `FLAG_SECURE` to block
system screenshots and screen recordings. Build locally with `npx cap sync android`, then run
`cd android && ./gradlew assembleDebug`. Pushes to `main` build the debug APK in GitHub Actions;
download it from the `Addis-Vault-APK` workflow artifact.

Paid reader access is associated with the browser/app installation device ID. Copy, context-menu,
and print actions are blocked in protected views; browser builds cannot reliably prevent all
screen capture. Generated document and video exports carry the Addis-Vault single-user watermark
unless the separate watermark-removal add-on is included at checkout (free for the verified
Owner).

## AI App Builder

Open **App Builder** from the navigation to create or import a project. New workspaces are
empty. Import HTML, JavaScript, JSX, CSS, JSON, ZIP archives, or source files from a public
GitHub repository.

The builder supports OpenRouter, Gemini, Groq, and custom OpenAI-compatible endpoints. API
keys are stored in browser `localStorage` and sent directly to the selected provider. GitHub
tokens are also stored in browser storage when saved and are sent directly to GitHub. Avoid
using saved credentials on shared devices.

Browser-delivered code can be inspected or copied, and browser scripts cannot reliably block
developer tools or operating-system screenshots. Protected previews use a visible watermark;
keep secrets and privileged operations on the server.

Export a standalone HTML app, a PWA package, or a ZIP source bundle. Public links encode the
project in the URL hash; anyone with the link can read its source. Use the export package for
larger projects.

## Deployment

The app includes a web manifest and service worker. Vercel response headers are configured in
`vercel.json`; Netlify-compatible static headers are in `public/_headers`. GitHub Pages does
not support custom response headers, so browser-enforced Permissions-Policy restrictions
cannot be guaranteed on that host.

The owner panel remains restricted to an authenticated administrator. Its local settings are
stored in the current browser and are not platform-wide.
