import { linkEmail, randomNickname, sendEmailOtp, verifyEmailOtp } from '@duongsinh/sync';
import {
  BOARD_THEMES,
  Board,
  Button,
  Card,
  colors,
  fonts,
  Logo,
  Piece,
  space,
} from '@duongsinh/ui';
import { useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Screen, Section } from '@/components/Screen';
import i18n, { useLang } from '@/lib/i18n';
import { useProgress, useSettings } from '@/lib/store';
import { db, syncNow, useAccount } from '@/lib/sync';

const AVATARS = ['p', 'n', 'b', 'r', 'q', 'k'] as const;

export default function SettingsScreen() {
  const { t, lang } = useLang();
  const settings = useSettings();
  const account = useAccount();
  const progress = useProgress();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState<null | 'email' | 'email_change'>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const confirm = (text: string, onYes: () => void) => {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.confirm(text)) onYes();
    } else
      Alert.alert(text, undefined, [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('common.yes'), onPress: onYes },
      ]);
  };

  const run = async (fn: () => Promise<void>, ok: string) => {
    try {
      await fn();
      setMsg(ok);
    } catch (e) {
      setMsg(`⚠ ${e instanceof Error ? e.message : String(e)}`);
    }
  };

  return (
    <Screen back title={t('settings.title')} testID="screen-settings">
      <Section title={t('settings.language')}>
        <View style={styles.row}>
          {(['vi', 'en'] as const).map((l) => (
            <Button
              key={l}
              title={l === 'vi' ? 'Tiếng Việt' : 'English'}
              tone={lang === l ? 'primary' : 'ghost'}
              size="sm"
              testID={`lang-${l}`}
              onPress={() => {
                settings.set({ lang: l });
                void i18n.changeLanguage(l);
              }}
            />
          ))}
        </View>
      </Section>

      <Section title={t('settings.account')}>
        <Card style={{ gap: 12 }}>
          <Text style={styles.label}>{t('settings.nickname')}</Text>
          <Text style={styles.name}>{account.profile?.nickname ?? settings.nickname ?? '…'}</Text>
          <View style={styles.row}>
            {AVATARS.map((a) => (
              <Pressable
                key={a}
                onPress={() =>
                  void account.rename(account.profile?.nickname ?? settings.nickname ?? '', a)
                }
                style={[
                  styles.avatar,
                  (account.profile?.avatar ?? settings.avatar) === a && styles.avatarOn,
                ]}
              >
                <Piece type={a} color="b" size={36} />
              </Pressable>
            ))}
          </View>
          <Button
            title={t('settings.changeName')}
            tone="light"
            size="sm"
            onPress={() => {
              const n = randomNickname();
              void run(() => account.rename(n.nickname, n.avatar), '✓');
            }}
          />
          <Text style={styles.label}>{t('settings.linkEmail')}</Text>
          <Text style={styles.small}>{t('settings.linkEmailHelp')}</Text>
          <View style={styles.row}>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="email@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              style={[styles.input, { flex: 1 }]}
            />
            <Button
              title={t('settings.sendCode')}
              size="sm"
              disabled={!/.+@.+\..+/.test(email)}
              onPress={() => {
                const c = db();
                if (!c) return;
                // Đã có phiên (ẩn danh) → liên kết email; chưa có → đăng nhập bằng mã OTP.
                const linking = account.status === 'ready';
                void run(async () => {
                  if (linking) await linkEmail(c, email);
                  else await sendEmailOtp(c, email);
                  setOtpSent(linking ? 'email_change' : 'email');
                }, '✓ Email đã gửi');
              }}
            />
          </View>
          {otpSent && (
            <View style={styles.row}>
              <TextInput
                value={otp}
                onChangeText={setOtp}
                placeholder={t('settings.otp')}
                style={[styles.input, { flex: 1 }]}
                keyboardType="number-pad"
              />
              <Button
                title={t('settings.verify')}
                size="sm"
                onPress={() => {
                  const c = db();
                  if (c && otpSent)
                    void run(
                      () =>
                        verifyEmailOtp(c, email, otp, otpSent).then(() => void account.connect()),
                      '✓',
                    );
                }}
              />
            </View>
          )}
        </Card>
      </Section>

      <Section title={t('settings.sync')}>
        <Card style={{ gap: 8 }}>
          <Text style={styles.small}>
            {progress.lastSync
              ? t('settings.lastSync', { time: new Date(progress.lastSync).toLocaleString() })
              : t('common.offline')}
          </Text>
          {progress.outbox.length > 0 && (
            <Text style={styles.small}>
              {t('settings.pending', { count: progress.outbox.length })}
            </Text>
          )}
          <Button
            title={t('settings.syncNow')}
            tone="light"
            size="sm"
            onPress={() => void syncNow().then((ok) => setMsg(ok ? '✓' : t('common.offline')))}
          />
        </Card>
      </Section>

      <Section title={t('settings.boardTheme')}>
        <View style={styles.row}>
          {BOARD_THEMES.map((th) => (
            <Pressable
              key={th.id}
              onPress={() => settings.set({ boardTheme: th.id })}
              style={[styles.theme, settings.boardTheme === th.id && styles.themeOn]}
            >
              <Board fen="8/8/8/3k4/4K3/8/8/8 w - - 0 1" size={96} theme={th} showCoords={false} />
              <Text style={styles.small}>{th.name[lang]}</Text>
            </Pressable>
          ))}
        </View>
        <Card style={styles.switchRow}>
          <Text style={styles.text}>{t('settings.sound')}</Text>
          <Switch
            value={settings.sound}
            onValueChange={(v) => settings.set({ sound: v })}
            trackColor={{ true: colors.primary }}
          />
        </Card>
        <Card style={styles.switchRow}>
          <Text style={styles.text}>{t('settings.coords')}</Text>
          <Switch
            value={settings.coords}
            onValueChange={(v) => settings.set({ coords: v })}
            trackColor={{ true: colors.primary }}
          />
        </Card>
      </Section>

      <Section title={t('settings.about')}>
        <Card style={{ gap: 10 }}>
          <Logo size={40} />
          <Text style={styles.text}>{t('settings.aboutText')}</Text>
          <Text style={styles.small}>{t('settings.contact')}</Text>
        </Card>
        <Button
          title={t('settings.resetProgress')}
          tone="danger"
          size="sm"
          onPress={() => confirm(t('settings.resetConfirm'), () => progress.reset())}
        />
      </Section>
      {msg && <Text style={styles.msg}>{msg}</Text>}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center' },
  label: {
    fontFamily: fonts.bold,
    fontSize: 12,
    letterSpacing: 0.6,
    color: colors.muted,
    textTransform: 'uppercase',
  },
  name: { fontFamily: fonts.black, fontSize: 22, color: colors.primary },
  text: { fontFamily: fonts.regular, fontSize: 15, color: colors.text, lineHeight: 21 },
  small: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted },
  avatar: { padding: 4, borderRadius: 12, borderWidth: 1.5, borderColor: colors.border },
  avatarOn: { borderColor: colors.orange, backgroundColor: colors.goldLight },
  input: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 10,
    fontFamily: fonts.regular,
    fontSize: 15,
    backgroundColor: colors.bg,
  },
  theme: {
    alignItems: 'center',
    gap: 4,
    padding: 6,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  themeOn: { borderColor: colors.orange },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  msg: { fontFamily: fonts.medium, fontSize: 14, color: colors.primary, marginTop: space.md },
});
