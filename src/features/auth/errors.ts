/** Maps Supabase / flow errors to i18n keys so screens never show raw messages. */
export function authErrorKey(e: unknown): string {
  const msg = e instanceof Error ? e.message : String(e);
  if (msg === 'auth/not-configured') return 'auth.errors.notConfigured';
  if (msg === 'auth/email-taken') return 'auth.errors.emailTaken';
  if (msg === 'auth/not-confirmed') return 'auth.errors.notConfirmed';
  if (msg === 'auth/cancelled') return 'auth.errors.cancelled';
  if (msg === 'auth/google-not-configured' || msg === 'auth/no-token') return 'auth.errors.googleOff';
  if (/SIGN_IN_CANCELLED|12501/i.test(msg)) return 'auth.errors.cancelled';
  if (/DEVELOPER_ERROR|10:/i.test(msg)) return 'auth.errors.googleDev';
  if (/invalid login credentials/i.test(msg)) return 'auth.errors.invalid';
  if (/password should be at least|weak password/i.test(msg)) return 'auth.errors.weakPassword';
  if (/valid email|invalid email/i.test(msg)) return 'auth.errors.badEmail';
  if (/rate limit|too many/i.test(msg)) return 'auth.errors.rateLimit';
  if (/provider is not enabled|unsupported provider/i.test(msg)) return 'auth.errors.googleOff';
  if (/network|fetch/i.test(msg)) return 'auth.errors.network';
  return 'auth.errors.generic';
}

export const isValidEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s.trim());
