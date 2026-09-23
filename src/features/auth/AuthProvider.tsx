import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import Constants from 'expo-constants';
import type { Session } from '@supabase/supabase-js';
import { supabase, supabaseConfigured } from '@/lib/supabase';
import { getSetting, setSetting } from '@/db/settings';

WebBrowser.maybeCompleteAuthSession();

export type PendingSignup = { email: string; password: string } | null;

type AuthContextValue = {
  /** null until the stored session has been read once */
  ready: boolean;
  session: Session | null;
  /** Offline mode chosen on the welcome screen (no account). */
  guest: boolean;
  configured: boolean;
  pending: PendingSignup;
  signUp: (email: string, password: string) => Promise<'confirm' | 'done'>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  resendConfirmation: (email: string) => Promise<void>;
  /** Tries the pending credentials once; resolves true when the email is now confirmed. */
  tryPendingSignIn: () => Promise<boolean>;
  continueAsGuest: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

/** Deep-link target for OAuth and email links: nowbi://auth/callback (exp://… inside Expo Go). */
export const authRedirectUrl = () => Linking.createURL('auth/callback');

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [guest, setGuest] = useState(false);
  const pendingRef = useRef<PendingSignup>(null);
  const [pending, setPending] = useState<PendingSignup>(null);

  // 1. Restore the stored session (or guest flag) once at startup.
  useEffect(() => {
    let alive = true;
    (async () => {
      const g = (await getSetting('guest')) === '1';
      if (supabase) {
        const { data } = await supabase.auth.getSession();
        if (alive) setSession(data.session);
      }
      if (alive) {
        setGuest(g);
        setReady(true);
      }
    })();
    const sub = supabase?.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (s) {
        pendingRef.current = null;
        setPending(null);
      }
    });
    return () => {
      alive = false;
      sub?.data.subscription.unsubscribe();
    };
  }, []);

  // 2. Keep tokens fresh while the app is in the foreground.
  useEffect(() => {
    const client = supabase;
    if (!client) return;
    const onChange = (state: string) => {
      if (state === 'active') client.auth.startAutoRefresh();
      else client.auth.stopAutoRefresh();
    };
    const sub = AppState.addEventListener('change', onChange);
    onChange(AppState.currentState);
    return () => sub.remove();
  }, []);

  // 3. Handle links that open the app: OAuth code, or the email confirmation redirect.
  const handledCodes = useRef(new Set<string>());
  const exchangeCode = useCallback(async (code: string) => {
    const client = supabase;
    if (!client || handledCodes.current.has(code)) return;
    handledCodes.current.add(code);
    const { error } = await client.auth.exchangeCodeForSession(code);
    if (error) console.warn('code exchange failed', error.message);
  }, []);

  useEffect(() => {
    const client = supabase;
    if (!client) return;
    const handle = async (url: string | null) => {
      if (!url || !url.includes('auth/callback')) return;
      const parsed = new URL(url);
      const code = parsed.searchParams.get('code');
      if (code) {
        await exchangeCode(code);
        return;
      }
      // Implicit fragment (#access_token=…) from an older email template.
      const frag = parsed.hash?.replace(/^#/, '') ?? '';
      const p = new URLSearchParams(frag);
      const access = p.get('access_token');
      const refresh = p.get('refresh_token');
      if (access && refresh) await client.auth.setSession({ access_token: access, refresh_token: refresh });
    };
    Linking.getInitialURL().then(handle);
    const sub = Linking.addEventListener('url', (e) => handle(e.url));
    return () => sub.remove();
  }, [exchangeCode]);

  const requireClient = () => {
    if (!supabase) throw new Error('auth/not-configured');
    return supabase;
  };

  const signUp = useCallback(async (email: string, password: string) => {
    const client = requireClient();
    const { data, error } = await client.auth.signUp({ email, password, options: { emailRedirectTo: authRedirectUrl() } });
    if (error) throw error;
    // Supabase returns a user with no identities when the address is already registered.
    if (data.user && data.user.identities && data.user.identities.length === 0) throw new Error('auth/email-taken');
    if (data.session) return 'done';
    pendingRef.current = { email, password };
    setPending({ email, password });
    return 'confirm';
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const client = requireClient();
    const { error } = await client.auth.signInWithPassword({ email, password });
    if (error) {
      if (/not confirmed/i.test(error.message)) {
        pendingRef.current = { email, password };
        setPending({ email, password });
        throw new Error('auth/not-confirmed');
      }
      throw error;
    }
  }, []);

  const tryPendingSignIn = useCallback(async () => {
    const client = requireClient();
    const p = pendingRef.current;
    if (!p) return false;
    const { error } = await client.auth.signInWithPassword({ email: p.email, password: p.password });
    return !error;
  }, []);

  const resendConfirmation = useCallback(async (email: string) => {
    const client = requireClient();
    const { error } = await client.auth.resend({ type: 'signup', email, options: { emailRedirectTo: authRedirectUrl() } });
    if (error) throw error;
  }, []);

  /** Waits briefly for a session to appear (the deep-link handler may finish the exchange). */
  const waitForSession = useCallback(async (ms: number) => {
    const client = requireClient();
    const started = Date.now();
    while (Date.now() - started < ms) {
      const { data } = await client.auth.getSession();
      if (data.session) return true;
      await new Promise((r) => setTimeout(r, 400));
    }
    return false;
  }, []);

  /** Browser-based OAuth (Expo Go, or when the native module is unavailable). */
  const signInWithGoogleWeb = useCallback(async () => {
    const client = requireClient();
    const redirectTo = authRedirectUrl();
    const { data, error } = await client.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo, skipBrowserRedirect: true, queryParams: { prompt: 'select_account' } },
    });
    if (error) throw error;
    if (!data.url) throw new Error('auth/no-url');
    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo, { showInRecents: true });
    if (result.type === 'success') {
      const code = new URL(result.url).searchParams.get('code');
      if (code) await exchangeCode(code);
    }
    // Android often reports "dismiss" even though the return link reached the app; give it a moment.
    if (!(await waitForSession(6000))) throw new Error('auth/cancelled');
  }, [exchangeCode, waitForSession]);

  /** Native account picker (development and Play builds): no browser, shows "Nowbi", not a domain. */
  const signInWithGoogleNative = useCallback(async () => {
    const client = requireClient();
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require('@react-native-google-signin/google-signin') as typeof import('@react-native-google-signin/google-signin');
    const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
    if (!webClientId) throw new Error('auth/google-not-configured');
    mod.GoogleSignin.configure({ webClientId });
    await mod.GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    try {
      await mod.GoogleSignin.signOut();
    } catch {
      // ignore: nothing to sign out from
    }
    const res = await mod.GoogleSignin.signIn();
    if (!mod.isSuccessResponse(res)) throw new Error('auth/cancelled');
    const idToken = res.data.idToken;
    if (!idToken) throw new Error('auth/no-token');
    const { error } = await client.auth.signInWithIdToken({ provider: 'google', token: idToken });
    if (error) throw error;
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const inExpoGo = Constants.appOwnership === 'expo';
    if (inExpoGo || !process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID) return signInWithGoogleWeb();
    try {
      await signInWithGoogleNative();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      // Native module missing (e.g. a build without it): fall back to the browser flow.
      if (/RNGoogleSignin|TurboModule|not found|Cannot read/i.test(msg)) return signInWithGoogleWeb();
      throw e;
    }
  }, [signInWithGoogleWeb, signInWithGoogleNative]);

  const continueAsGuest = useCallback(async () => {
    await setSetting('guest', '1');
    setGuest(true);
  }, []);

  const signOut = useCallback(async () => {
    await setSetting('guest', '0');
    setGuest(false);
    pendingRef.current = null;
    setPending(null);
    if (supabase) await supabase.auth.signOut();
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const mod = require('@react-native-google-signin/google-signin') as typeof import('@react-native-google-signin/google-signin');
      await mod.GoogleSignin.signOut();
    } catch {
      // not available in Expo Go: fine
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ ready, session, guest, configured: supabaseConfigured, pending, signUp, signIn, signInWithGoogle, resendConfirmation, tryPendingSignIn, continueAsGuest, signOut }),
    [ready, session, guest, pending, signUp, signIn, signInWithGoogle, resendConfirmation, tryPendingSignIn, continueAsGuest, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth outside AuthProvider');
  return ctx;
}
