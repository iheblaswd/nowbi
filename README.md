# nowbi

A calm daily companion for adults with ADHD: dump your brain, see one thing, do it with company, no shame.

Android first (Google Play), built with Expo + React Native + TypeScript, local-first SQLite, zero paid services.

## Run it

```bash
npm install
npx expo start
```

Scan the QR code with Expo Go on Android. Everything in the current feature set runs inside Expo Go; native widgets and the foreground service (later features) need a local development build (`npx expo run:android`).

## Checks

```bash
npx tsc --noEmit
npm test
```

## Features shipped so far

1. **Daily loop** — Sticker Bomb design system, EN/FR/AR with RTL, local SQLite store, Now screen with Done / Not now (Not now rolls to Later, never "overdue"), Up next, done count, meds "taken at" sticker.
2. **Brain dump → plan** — type everything messy; the on-device rules planner splits it into tasks (EN/FR/AR fillers stripped), guesses durations, adds four steps to anything over 25 min, buckets the first as Now and the next few as Next (fewer on low-energy days); reorder, remove, confirm. Plus the **Plan** tab: Now / Next / Later / Done with one-tap moves, and bottom tabs.
3. **Welcome + accounts** — first screen with the pitch, then Google sign-in or email + password (Supabase, free tier). Email sign-up sends a branded confirmation email (`supabase/templates/confirm-signup.html`); the app shows a loader and logs in by itself the moment the link is clicked. Google uses the native account picker in development/Play builds (browser fallback in Expo Go). The confirmation link points to your own GitHub Pages page (`docs/confirm/`). Log out from Settings. Setup: `SETUP-AUTH.md`; without `.env` the app offers "Continue without an account".

## Structure

```
src/app/         Expo Router screens (welcome, auth/*, (tabs)/index = Now, (tabs)/plan, dump, settings)
src/components/  design system (Sticker, Button, Card, TimeBar, TaskRow, Screen)
src/db/          SQLite: database.ts (schema), tasks.ts, plans.ts, settings.ts
src/features/    per-feature logic (now/useNow.ts, dump/planner.ts + tests, auth/AuthProvider.tsx)
src/lib/         supabase client (reads EXPO_PUBLIC_SUPABASE_* from .env)
src/i18n/        i18next setup + locales
src/theme/       tokens
```

## Design rules

One screen per moment, two taps maximum, nothing red for state, nothing dies, nothing resets, every AI output editable, prices on the landing page, data on the device.
