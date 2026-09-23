# Auth setup (Supabase, free tier)

Everything here is free. It takes about 15 minutes once.

## 1. Create the project

1. https://supabase.com → New project → name `nowbi`, region close to your users, free plan.
2. Project Settings → API: copy **Project URL** and **anon public** key.
3. In the repo, copy `.env.example` to `.env` and paste both values. Restart `npx expo start` (env is read at start).

## 2. Email + password with confirmation (Nowbi sends its own emails)

Same architecture as FPL iQ: Supabase never emails anyone. Its **Send Email hook** calls a tiny Cloudflare Worker of ours (`workers/mail`, free plan), which puts the token in a link to **our** page (`https://iheblaswd.github.io/nowbi/confirm/`) and sends the Nowbi-designed email from a Nowbi Gmail account. Nothing says supabase.co, the subject and design are ours, and the free-tier template lock does not matter.

1. Authentication → Providers → Email: **Enable email provider** on, **Confirm email** on.
2. Gmail for the sender: a Google account for Nowbi (e.g. `nowbi.app@gmail.com`) with 2-Step Verification on, then https://myaccount.google.com/apppasswords → app password (16 characters).
3. Deploy the worker (once, from the repo root; Cloudflare free account):
   ```
   cd workers\mail
   npm install
   npx wrangler login
   npx wrangler deploy
   ```
   Note the URL it prints: `https://nowbi-mail.<your-account>.workers.dev`.
4. Supabase → Authentication → Hooks → **Send Email** → Enable → type **HTTPS** → URL `https://nowbi-mail.<your-account>.workers.dev/auth/send` → **Generate secret** → copy it (`v1,whsec_…`) → Save.
5. Give the worker its three secrets (still in `workers\mail`):
   ```
   npx wrangler secret put SEND_EMAIL_HOOK_SECRET
   npx wrangler secret put GMAIL_USER
   npx wrangler secret put GMAIL_APP_PASSWORD
   ```
6. Authentication → URL Configuration:
   - Site URL: `https://iheblaswd.github.io/nowbi`. Later: `https://nowbi.app`.
   - Redirect URLs: `nowbi://**`, `exp://**`, `https://mewnfkmurutnlzvwvcvx.supabase.co/**`.

How the flow works in the app: sign-up sends the email (in the app's language, `user_metadata.lang`), the app shows the loader screen and polls sign-in every 4 s with the credentials kept in memory; the moment the link is tapped our page verifies the token, the email is confirmed, sign-in succeeds and the app opens. On the phone the page also deep-links back into the app. The same worker sends password-reset, magic-link and email-change emails; the reset link opens a "choose a new password" form on our page.

Test the worker without an email: `cd workers\mail && npm test`. Watch it live while signing up: `npx wrangler tail`.

## 2b. The confirmation page (free, GitHub Pages)

`docs/confirm/index.html` verifies the token and opens the app.

1. Put your publishable key in `docs/confirm/config.js` (same value as `.env`), commit, push.
2. GitHub → repo `nowbi` → Settings → Pages → Source: Deploy from a branch, Branch `main`, folder `/docs`, Save. After a minute the page is at `https://iheblaswd.github.io/nowbi/confirm/`.
3. When you own `nowbi.app`: add it as the custom domain in GitHub Pages, change `CONFIRM_URL` in `workers/mail/wrangler.toml`, redeploy the worker, and change the Site URL.

## 3. Google sign-in (native popup, like FPL IQ)

The app uses Google's native account picker: no browser, a popup inside the app, tap the account, logged in. It runs in a development build or the Play build (Expo Go cannot load the native module and falls back to the browser flow).

1. Google Cloud → **Identifiants → Créer des identifiants → ID client OAuth → Application Web**, name `Nowbi web`, redirect URI `https://YOUR-PROJECT-REF.supabase.co/auth/v1/callback`. Copy its Client ID into `.env` as `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`, and its ID + secret into Supabase → Authentication → Providers → Google (also tick *Skip nonce checks*).
2. Get the debug signing SHA-1. The development build is signed with the keystore **inside the project** (`android/app/debug.keystore`, created by `npx expo run:android`), not the one in your user folder. PowerShell, from the repo root, after the first `npx expo run:android`:
   `keytool -list -v -keystore android\app\debug.keystore -alias androiddebugkey -storepass android -keypass android | Select-String SHA1`
   (Expo's default debug keystore gives `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`.)
3. Google Cloud → **Créer des identifiants → ID client OAuth → Android**, name `Nowbi Android debug`, package `com.nowbi.app`, paste the SHA-1. (Before Play: add a second Android client with the Play App Signing SHA-1 from Play Console → App integrity.)
4. Build and run the development build once (Android Studio + a phone on USB with USB debugging, or an emulator):
   `npx expo run:android`
   From then on `npm start` reloads code into that build; Expo Go is no longer needed.

## 3b. Google sign-in in Expo Go (fallback)

1. https://console.cloud.google.com → create a project → APIs & Services → OAuth consent screen (External, app name Nowbi, your email).
2. Credentials → Create credentials → OAuth client ID → **Web application**.
   Authorized redirect URI: `https://YOUR-PROJECT-REF.supabase.co/auth/v1/callback`.
3. Copy Client ID and Client secret into Supabase → Authentication → Providers → Google, enable it.
4. In Expo Go the sign-in opens a browser and returns through `exp://…/--/auth/callback`; in the real build through `nowbi://auth/callback`. Both are in the Redirect URLs list above.

## 4. Test

```
npx expo start --tunnel
```

Welcome → Sign up with email → check the inbox (spam too) → tap Confirm → back in the app the loader turns into the Now screen. Log out from Settings, then Log in.
