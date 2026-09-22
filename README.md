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
npx expo lint
```

## Features shipped so far

1. **Daily loop** — Sticker Bomb design system, EN/FR/AR with RTL, local SQLite store, Now screen with Done / Not now (Not now rolls to Later, never "overdue"), Up next, done count, meds "taken at" sticker.

## Structure

```
src/app/         Expo Router screens (index = Now, settings)
src/components/  design system (Sticker, Button, Card, TimeBar, TaskRow, Screen)
src/db/          SQLite: database.ts (schema), tasks.ts, plans.ts, settings.ts
src/features/    hooks per feature (now/useNow.ts)
src/i18n/        i18next setup + locales
src/theme/       tokens
```

## Design rules

One screen per moment, two taps maximum, nothing red for state, nothing dies, nothing resets, every AI output editable, prices on the landing page, data on the device.
