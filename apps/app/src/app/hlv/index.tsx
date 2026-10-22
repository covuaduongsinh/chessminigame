import { createGroup, type GroupKind, type MyGroup, myGroups } from '@duongsinh/sync';
import { Button, Card, colors, fonts, Pill, space } from '@duongsinh/ui';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Screen, Section } from '@/components/Screen';
import { useLang } from '@/lib/i18n';
import { db, useAccount } from '@/lib/sync';

const KINDS: GroupKind[] = ['club', 'class', 'family'];

export default function CoachHome() {
  const { t } = useLang();
  const account = useAccount();
  const [groups, setGroups] = useState<MyGroup[]>([]);
  const [name, setName] = useState('');
  const [kind, setKind] = useState<GroupKind>('club');
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const c = db();
    if (!c || !account.profile) return;
    try {
      const gs = await myGroups(c, account.profile.id);
      setGroups(gs.filter((g) => g.myRole !== 'member'));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }, [account.profile]);

  useEffect(() => {
    void load();
  }, [load]);

  const create = async () => {
    const c = db();
    if (!c || name.trim().length < 2) return;
    try {
      const g = await createGroup(c, name.trim(), kind);
      setName('');
      router.push(`/hlv/${g.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <Screen back title={t('coach.title')} testID="screen-coach">
      {account.status !== 'ready' ? (
        <Card>
          <Text style={styles.text}>{t('club.notConfigured')}</Text>
          <Button title={t('common.retry')} tone="light" size="sm" onPress={() => void account.connect()} />
        </Card>
      ) : (
        <>
          <Card style={{ gap: 10 }}>
            <Text style={styles.label}>{t('coach.createGroup')}</Text>
            <TextInput value={name} onChangeText={setName} placeholder={t('coach.groupName')} style={styles.input} testID="group-name" />
            <View style={styles.row}>
              {KINDS.map((k) => (
                <Button key={k} title={t(`coach.kind.${k}`)} tone={kind === k ? 'primary' : 'ghost'} size="sm" onPress={() => setKind(k)} />
              ))}
            </View>
            <Button title={t('coach.createGroup')} tone="accent" onPress={() => void create()} disabled={name.trim().length < 2} testID="create-group" />
          </Card>
          <Section title={t('club.myGroups')}>
            {groups.map((g) => (
              <Pressable key={g.id} onPress={() => router.push(`/hlv/${g.id}`)}>
                <Card style={styles.groupRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.groupName}>{g.name}</Text>
                    <Text style={styles.small}>
                      {t('coach.code')}: <Text style={styles.code}>{g.join_code}</Text>
                    </Text>
                  </View>
                  <Pill text={t(`coach.kind.${g.kind}`)} />
                  <Text style={styles.arrow}>›</Text>
                </Card>
              </Pressable>
            ))}
          </Section>
        </>
      )}
      <Section title={t('classroom.title')}>
        <Button title={t('classroom.pick')} tone="light" onPress={() => router.push('/lop-hoc')} />
      </Section>
      {error && <Text style={styles.error}>{error}</Text>}
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: { fontFamily: fonts.bold, fontSize: 12, letterSpacing: 0.6, color: colors.muted, textTransform: 'uppercase' },
  text: { fontFamily: fonts.regular, fontSize: 15, color: colors.text, marginBottom: 8 },
  small: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted },
  code: { fontFamily: fonts.black, color: colors.primary, letterSpacing: 2 },
  input: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 12,
    fontFamily: fonts.regular,
    fontSize: 16,
    backgroundColor: colors.bg,
    color: colors.text,
  },
  row: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  groupRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  groupName: { fontFamily: fonts.bold, fontSize: 17, color: colors.text },
  arrow: { fontFamily: fonts.bold, fontSize: 26, color: colors.muted },
  error: { fontFamily: fonts.medium, fontSize: 14, color: colors.red, marginTop: space.md },
});
