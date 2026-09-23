# Auth setup (Supabase, free tier)

Everything here is free. It takes about 15 minutes once.

## 1. Create the project

1. https://supabase.com → New project → name `nowbi`, region close to your users, free plan.
2. Project Settings → API: copy **Project URL** and **anon public** key.
3. In the repo, copy `.env.example` to `.env` and paste both values. Restart `npx expo start` (env is read at start).

## 2. Email + password with confirmation

1. Authentication → Providers → Email: keep **Enable email provider** on and **Confirm email** on.
2. Authentication → Email Templates → **Confirm signup**: subject `Confirm your Nowbi account`, body = the contents of `supabase/templates/confirm-signup.html`. Keep `{{ .ConfirmationURL }}` as is.
3. Authentication → URL Configuration:
   - Site URL: `https://iheblaswd.github.io/nowbi` (the confirmation page below lives there; the email template builds the link as `{{ .SiteURL }}/confirm/…`). Later: `https://nowbi.app`.
   - Redirect URLs, add all three (Supabase falls back to the Site URL when the app's return address is not listed):
     - `nowbi://**`
     - `exp://**` (Expo Go during development, LAN or tunnel)
     - `https://YOUR-PROJECT-REF.supabase.co/**`

How the flow works in the app: sign-up sends the email, the app shows the loader screen and polls sign-in every 4 s with the credentials kept in memory; the moment the link is clicked the email is confirmed, sign-in succeeds and the app opens. Clicking the link on the phone also deep-links back into the app.

Free-tier note: Supabase's built-in mailer allows only a few emails per hour. For real users, Authentication → SMTP Settings: use a free SMTP such as Brevo (300/day) or Resend (3,000/month).

## 2b. Confirmation page on your own address (free, GitHub Pages)

The email link points to a page you host, not to supabase.co. `docs/confirm/index.html` verifies the token and opens the app.

1. Put your publishable key in `docs/confirm/config.js` (same value as `.env`), commit, push.
2. GitHub → repo `nowbi` → Settings → Pages → Source: Deploy from a branch, Branch `main`, folder `/docs`, Save. After a minute the page is at `https://iheblaswd.github.io/nowbi/confirm/`.
3. Supabase Site URL = `https://iheblaswd.github.io/nowbi` (step 2.3). When you own `nowbi.app`, add it as the custom domain in GitHub Pages and change the Site URL only.

## 3. Google sign-in (native popup, like FPL IQ)

The app uses Google's native account picker: no browser, a popup inside the app, tap the account, logged in. It runs in a development build or the Play build (Expo Go cannot load the native module and falls back to the browser flow).

1. Google Cloud → **Identifiants → Créer des identifiants → ID client OAuth → Application Web**, name `Nowbi web`, redirect URI `https://YOUR-PROJECT-REF.supabase.co/auth/v1/callback`. Copy its Client ID into `.env` as `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`, and its ID + secret into Supabase → Authentication → Providers → Google (also tick *Skip nonce checks*).
2. Get your debug signing SHA-1 (PowerShell):
   `keytool -list -v -keystore "$env:USERPROFILE\.android\debug.keystore" -alias androiddebugkey -storepass android -keypass android | Select-String SHA1`
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
