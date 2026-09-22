import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';
import { I18nManager } from 'react-native';
import en from './locales/en.json';
import fr from './locales/fr.json';
import ar from './locales/ar.json';
import { getSetting, setSetting } from '@/db/settings';

export const SUPPORTED = ['en', 'fr', 'ar'] as const;
export type Lang = (typeof SUPPORTED)[number];

export const isRTL = (lang: string) => lang === 'ar';

function deviceLang(): Lang {
  const code = getLocales()[0]?.languageCode ?? 'en';
  return (SUPPORTED as readonly string[]).includes(code) ? (code as Lang) : 'en';
}

/** Call once at startup, after the database is ready. Returns the active language. */
export async function initI18n(): Promise<Lang> {
  const saved = (await getSetting('lang')) as Lang | null;
  const lang = saved ?? deviceLang();
  await i18n.use(initReactI18next).init({
    resources: { en: { translation: en }, fr: { translation: fr }, ar: { translation: ar } },
    lng: lang,
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });
  // Keep the native layout direction in sync; a change needs one reload to apply fully.
  const rtl = isRTL(lang);
  I18nManager.allowRTL(rtl);
  if (I18nManager.isRTL !== rtl) I18nManager.forceRTL(rtl);
  return lang;
}

/** Persist and switch. Returns true when a reload is needed for the layout direction. */
export async function changeLanguage(lang: Lang): Promise<boolean> {
  await setSetting('lang', lang);
  await i18n.changeLanguage(lang);
  const rtl = isRTL(lang);
  const needsReload = I18nManager.isRTL !== rtl;
  I18nManager.allowRTL(rtl);
  I18nManager.forceRTL(rtl);
  return needsReload;
}

export default i18n;
