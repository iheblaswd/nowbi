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
   - Site URL: `nowbi://auth/callback`
   - Redirect URLs, add all three (Supabase falls back to `http://localhost:3000` when the app's return address is not listed):
     - `nowbi://**`
     - `exp://**` (Expo Go during development, LAN or tunnel)
     - `https://YOUR-PROJECT-REF.supabase.co/**`

How the flow works in the app: sign-up sends the email, the app shows the loader screen and polls sign-in every 4 s with the credentials kept in memory; the moment the link is clicked the email is confirmed, sign-in succeeds and the app opens. Clicking the link on the phone also deep-links back into the app.

Free-tier note: Supabase's built-in mailer allows only a few emails per hour. For real users, Authentication → SMTP Settings: use a free SMTP such as Brevo (300/day) or Resend (3,000/month).

## 3. Google sign-in

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
