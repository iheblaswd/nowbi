import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import { useFonts, ArchivoBlack_400Regular } from '@expo-google-fonts/archivo-black';
import { Nunito_600SemiBold, Nunito_700Bold, Nunito_800ExtraBold } from '@expo-google-fonts/nunito';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { getDb } from '@/db/database';
import { initI18n } from '@/i18n';
import { colors } from '@/theme/tokens';

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

  if (!fontsLoaded || !ready) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.ground, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.yellow} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.ground } }} />
    </SafeAreaProvider>
  );
}
