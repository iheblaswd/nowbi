import React, { useEffect, useState } from 'react';
import { Stack, router, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import { useFonts, ArchivoBlack_400Regular } from '@expo-google-fonts/archivo-black';
import { Nunito_600SemiBold, Nunito_700Bold, Nunito_800ExtraBold } from '@expo-google-fonts/nunito';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { getDb } from '@/db/database';
import { initI18n } from '@/i18n';
import { AuthProvider, useAuth } from '@/features/auth/AuthProvider';
import { colors } from '@/theme/tokens';

function Splash() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.ground, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator color={colors.yellow} />
    </View>
  );
}

/** Sends signed-out users to the welcome flow and signed-in users into the app. */
function Gate({ children }: { children: React.ReactNode }) {
  const { ready, session, guest } = useAuth();
  const segments = useSegments();
  const inAuth = segments[0] === 'welcome' || segments[0] === 'auth';
  const allowed = !!session || guest;

  useEffect(() => {
    if (!ready) return;
    if (!allowed && !inAuth) router.replace('/welcome');
    if (allowed && inAuth) router.replace('/');
  }, [ready, allowed, inAuth]);

  if (!ready) return <Splash />;
  return <>{children}</>;
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({ ArchivoBlack_400Regular, Nunito_600SemiBold, Nunito_700Bold, Nunito_800ExtraBold });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    getDb()
      .then(() => initI18n())
      .then(() => setReady(true))
      .catch((e) => {
        console.error('startup failed', e);
        setReady(true);
      });
  }, []);

  if (!fontsLoaded || !ready) return <Splash />;

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="light" />
        <Gate>
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.ground }, animation: 'fade' }} />
        </Gate>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
