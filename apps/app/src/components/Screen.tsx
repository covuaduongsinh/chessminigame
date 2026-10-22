import { colors, fonts, space } from '@duongsinh/ui';
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLang } from '@/lib/i18n';

interface ScreenProps {
  title?: string;
  subtitle?: string;
  back?: boolean;
  right?: ReactNode;
  scroll?: boolean;
  children: ReactNode;
  maxWidth?: number;
  contentStyle?: ViewStyle;
  testID?: string;
}

/** Khung màn hình chung: vùng an toàn, tiêu đề, nút quay lại, giới hạn bề rộng trên màn lớn. */
export function Screen({
  title,
  subtitle,
  back,
  right,
  scroll = true,
  children,
  maxWidth = 1100,
  contentStyle,
  testID,
}: ScreenProps) {
  const { t } = useLang();
  const body = (
    <View style={[styles.inner, { maxWidth }, contentStyle]}>
      {(title || back || right) && (
        <View style={styles.header}>
          {back && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('common.back')}
              onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
              style={styles.back}
              hitSlop={12}
            >
              <Text style={styles.backText}>‹</Text>
            </Pressable>
          )}
          <View style={{ flex: 1 }}>
            {title ? (
              <Text style={styles.title} numberOfLines={1}>
                {title}
              </Text>
            ) : null}
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
          {right}
        </View>
      )}
      {children}
    </View>
  );
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']} testID={testID}>
      {scroll ? (
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {body}
        </ScrollView>
      ) : (
        <View style={[styles.scroll, { flex: 1 }]}>{body}</View>
      )}
    </SafeAreaView>
  );
}

export function Section({
  title,
  children,
  right,
}: {
  title: string;
  children: ReactNode;
  right?: ReactNode;
}) {
  return (
    <View style={{ marginTop: space.lg, gap: space.sm }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={styles.section}>{title}</Text>
        {right}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: space.md, paddingBottom: space.xxl, alignItems: 'center' },
  inner: { width: '100%' },
  header: { flexDirection: 'row', alignItems: 'center', gap: space.sm, marginBottom: space.md },
  back: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    fontSize: 28,
    lineHeight: 30,
    color: colors.primary,
    fontFamily: fonts.bold,
    marginTop: -2,
  },
  title: { fontFamily: fonts.black, fontSize: 24, color: colors.primary },
  subtitle: { fontFamily: fonts.regular, fontSize: 14, color: colors.muted, marginTop: 2 },
  section: { fontFamily: fonts.bold, fontSize: 18, color: colors.text },
});
