import {
  Roboto_400Regular,
  Roboto_500Medium,
  Roboto_700Bold,
  Roboto_900Black,
  useFonts,
} from '@expo-google-fonts/roboto';
import { colors } from '@duongsinh/ui';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import i18n from '@/lib/i18n';
import { useSettings } from '@/lib/store';
import { syncNow, useAccount } from '@/lib/sync';

void SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [loaded] = useFonts({ Roboto_400Regular, Roboto_500Medium, Roboto_700Bold, Roboto_900Black });
  const lang = useSettings((s) => s.lang);

  useEffect(() => {
    if (lang && i18n.language !== lang) void i18n.changeLanguage(lang);
  }, [lang]);

  useEffect(() => {
    if (loaded) void SplashScreen.hideAsync().catch(() => {});
  }, [loaded]);

  // Kết nối máy chủ ở nền; app vẫn chạy đầy đủ khi ngoại tuyến.
  useEffect(() => {
    void useAccount.getState().connect();
    const id = setInterval(() => void syncNow(), 60_000);
    return () => clearInterval(id);
  }, []);

  if (!loaded) return null;
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }} />
    </SafeAreaProvider>
  );
}
