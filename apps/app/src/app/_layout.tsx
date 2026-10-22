import { colors } from '@duongsinh/ui';
import {
  Roboto_400Regular,
  Roboto_500Medium,
  Roboto_700Bold,
  Roboto_900Black,
  useFonts,
} from '@expo-google-fonts/roboto';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import i18n from '@/lib/i18n';
import { useSettings } from '@/lib/store';
import { syncNow, useAccount } from '@/lib/sync';

void SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Roboto_400Regular,
    Roboto_500Medium,
    Roboto_700Bold,
    Roboto_900Black,
  });
  // Web/desktop: trình duyệt tự đổi sang Roboto khi tải xong, không cần chờ (WebKit có lúc treo
  // việc tải font). Lỗi font cũng không được làm trắng màn hình: dùng font hệ thống thay thế.
  const loaded = fontsLoaded || fontError != null || Platform.OS === 'web';
  const lang = useSettings((s) => s.lang);

  useEffect(() => {
    if (lang && i18n.language !== lang) void i18n.changeLanguage(lang);
  }, [lang]);

  useEffect(() => {
    if (fontError) console.warn('Không tải được font Roboto:', fontError);
  }, [fontError]);

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
