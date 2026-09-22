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

## Structure

```
src/app/         Expo Router screens ((tabs)/index = Now, (tabs)/plan, dump, settings)
src/components/  design system (Sticker, Button, Card, TimeBar, TaskRow, Screen)
src/db/          SQLite: database.ts (schema), tasks.ts, plans.ts, settings.ts
src/features/    per-feature logic (now/useNow.ts, dump/planner.ts + tests)
src/i18n/        i18next setup + locales
src/theme/       tokens
```

## Design rules

One screen per moment, two taps maximum, nothing red for state, nothing dies, nothing resets, every AI output editable, prices on the landing page, data on the device.
