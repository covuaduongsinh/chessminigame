import { LEVELS, MINIGAMES, miniGamesOf } from '@duongsinh/minigames';
import {
  type Assignment,
  type CustomGameRow,
  createAssignment,
  deleteAssignment,
  type Group,
  type GroupProgressRow,
  groupMembers,
  groupProgress,
  leaveGroup,
  listAssignments,
  listCustomGames,
  type Member,
  saveCustomGame,
  setMemberRole,
} from '@duongsinh/sync';
import { Button, Card, colors, fonts, LEVEL_COLORS, Piece, space } from '@duongsinh/ui';
import * as Clipboard from 'expo-clipboard';
import * as Linking from 'expo-linking';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Screen, Section } from '@/components/Screen';
import { useCustomGames } from '@/lib/customStore';
import { useLang } from '@/lib/i18n';
import { db, useAccount } from '@/lib/sync';

export default function GroupDashboard() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, L } = useLang();
  const me = useAccount((s) => s.profile);
  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [progress, setProgress] = useState<GroupProgressRow[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [title, setTitle] = useState('');
  const [picked, setPicked] = useState<string[]>([]);
  const [groupCustoms, setGroupCustoms] = useState<CustomGameRow[]>([]);
  const localCustoms = useCustomGames((s) => s.items);
  const markShared = useCustomGames((s) => s.markShared);
  const [msg, setMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    const c = db();
    if (!c || !id) return;
    try {
      const { data } = await c.from('groups').select('*').eq('id', String(id)).single();
      setGroup(data);
      const [m, p, a] = await Promise.all([
        groupMembers(c, String(id)),
        groupProgress(c, String(id)),
        listAssignments(c, String(id)),
      ]);
      setMembers(m);
      setProgress(p);
      setAssignments(a);
      setGroupCustoms(await listCustomGames(c, String(id)));
    } catch (e) {
      setMsg(e instanceof Error ? e.message : String(e));
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  // stars[user][level] = tổng sao
  const heat = useMemo(() => {
    const byUser: Record<string, Record<string, number>> = {};
    const levelOf = new Map(MINIGAMES.map((g) => [g.id, g.level]));
    for (const r of progress) {
      if (!r.item_id) continue;
      const lvl = levelOf.get(r.item_id);
      if (!lvl) continue;
      const u = byUser[r.user_id] ?? {};
      u[lvl] = (u[lvl] ?? 0) + (r.best_stars ?? 0);
      byUser[r.user_id] = u;
    }
    return byUser;
  }, [progress]);

  const joinUrl = group
    ? Linking.createURL('/clb', { queryParams: { code: group.join_code } })
    : '';
  const students = members.filter((m) => m.user_id !== me?.id);

  const assign = async () => {
    const c = db();
    if (!c || !me || !group || picked.length === 0) return;
    try {
      await createAssignment(c, {
        group_id: group.id,
        title: title.trim() || t('coach.assign'),
        item_ids: picked,
        created_by: me.id,
      });
      setTitle('');
      setPicked([]);
      await load();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <Screen back title={group?.name ?? '…'} subtitle={t('coach.title')} testID="screen-group">
      {group && (
        <Card style={styles.codeCard}>
          <View style={{ flex: 1, gap: 6 }}>
            <Text style={styles.label}>{t('coach.code')}</Text>
            <Text style={styles.code} testID="group-code">
              {group.join_code}
            </Text>
            <Text style={styles.small}>{t('coach.share')}</Text>
            <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
              <Button
                title={t('common.copy')}
                tone="light"
                size="sm"
                onPress={() =>
                  void Clipboard.setStringAsync(group.join_code).then(() =>
                    setMsg(t('common.copied')),
                  )
                }
              />
              <Button
                title={t('coach.classroom')}
                tone="ghost"
                size="sm"
                onPress={() => router.push('/lop-hoc')}
              />
            </View>
          </View>
          <View style={styles.qr}>
            <QRCode value={joinUrl || group.join_code} size={120} color={colors.primary} />
          </View>
        </Card>
      )}

      <Section title={`${t('coach.heatmap')} (${students.length})`}>
        {students.length === 0 ? (
          <Text style={styles.small}>{t('coach.noMembers')}</Text>
        ) : (
          <Card style={{ padding: 0 }}>
            <ScrollView horizontal>
              <View>
                <View style={styles.heatRow}>
                  <Text style={[styles.heatName, styles.heatHead]}> </Text>
                  {LEVELS.map((l) => (
                    <View key={l.key} style={styles.heatCell}>
                      <Piece type={l.piece} color="b" size={22} />
                    </View>
                  ))}
                  <Text style={[styles.heatCellText, styles.heatHead]}>⭐</Text>
                </View>
                {students.map((m) => {
                  const u = heat[m.user_id] ?? {};
                  const total = Object.values(u).reduce((a, b) => a + b, 0);
                  return (
                    <View key={m.user_id} style={styles.heatRow}>
                      <Text style={styles.heatName} numberOfLines={1}>
                        {m.nickname}
                      </Text>
                      {LEVELS.map((l) => {
                        const v = u[l.key] ?? 0;
                        const max = miniGamesOf(l.key).length * 3;
                        const color = LEVEL_COLORS[l.key] ?? colors.primary;
                        const alpha = Math.round((v / max) * 255)
                          .toString(16)
                          .padStart(2, '0');
                        return (
                          <View
                            key={l.key}
                            style={[
                              styles.heatCell,
                              { backgroundColor: v ? `${color}${alpha}` : colors.bg },
                            ]}
                          >
                            <Text style={styles.heatValue}>{v || ''}</Text>
                          </View>
                        );
                      })}
                      <Text style={styles.heatCellText}>{total}</Text>
                      <Pressable
                        onPress={() => {
                          const c = db();
                          if (c && group)
                            void setMemberRole(
                              c,
                              group.id,
                              m.user_id,
                              m.role === 'coach' ? 'member' : 'coach',
                            ).then(load);
                        }}
                      >
                        <Text style={styles.action}>{m.role === 'coach' ? '★' : '☆'}</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => {
                          const c = db();
                          if (c && group) void leaveGroup(c, group.id, m.user_id).then(load);
                        }}
                      >
                        <Text style={[styles.action, { color: colors.red }]}>✕</Text>
                      </Pressable>
                    </View>
                  );
                })}
              </View>
            </ScrollView>
          </Card>
        )}
      </Section>

      <Section title={t('custom.list')}>
        {Object.values(localCustoms).length === 0 ? (
          <Text style={styles.small}>{t('custom.empty')}</Text>
        ) : (
          Object.values(localCustoms).map((g) => {
            const sharedId = group ? g.shared[group.id] : undefined;
            return (
              <Card key={g.id} style={styles.assignment}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.assignTitle}>🎯 {g.title}</Text>
                  <Text style={styles.small}>{L(g.def.goal)}</Text>
                </View>
                {sharedId ? (
                  <Text style={styles.small}>✓ {t('custom.shared')}</Text>
                ) : (
                  <Button
                    title={t('custom.share')}
                    tone="light"
                    size="sm"
                    onPress={() => {
                      const c = db();
                      if (!c || !me || !group) return;
                      void saveCustomGame(c, {
                        owner_id: me.id,
                        title: g.title,
                        def: g.def,
                        group_id: group.id,
                      })
                        .then((row) => {
                          markShared(g.id, group.id, row.id);
                          return load();
                        })
                        .catch((e: Error) => setMsg(e.message));
                    }}
                  />
                )}
              </Card>
            );
          })
        )}
      </Section>

      <Section title={t('coach.assign')}>
        <Card style={{ gap: 10 }}>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder={t('coach.assignTitle')}
            style={styles.input}
          />
          <Text style={styles.label}>{t('coach.pickGames')}</Text>
          {LEVELS.map((l) => (
            <View key={l.key} style={styles.pickRow}>
              {miniGamesOf(l.key).map((g) => {
                const on = picked.includes(g.id);
                return (
                  <Pressable
                    key={g.id}
                    onPress={() =>
                      setPicked((p) => (on ? p.filter((x) => x !== g.id) : [...p, g.id]))
                    }
                    style={[
                      styles.pick,
                      on && {
                        backgroundColor: LEVEL_COLORS[l.key],
                        borderColor: LEVEL_COLORS[l.key],
                      },
                    ]}
                  >
                    <Text style={[styles.pickText, on && { color: colors.white }]}>
                      {L(g.title)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ))}
          {groupCustoms.length > 0 && (
            <View style={styles.pickRow}>
              {groupCustoms.map((g) => {
                const key = `custom:${g.id}`;
                const on = picked.includes(key);
                return (
                  <Pressable
                    key={key}
                    onPress={() =>
                      setPicked((p) => (on ? p.filter((x) => x !== key) : [...p, key]))
                    }
                    style={[
                      styles.pick,
                      on && { backgroundColor: colors.orange, borderColor: colors.orange },
                    ]}
                  >
                    <Text style={[styles.pickText, on && { color: colors.white }]}>
                      🎯 {g.title}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}
          <Button
            title={`${t('coach.assign')} (${picked.length})`}
            tone="accent"
            disabled={picked.length === 0}
            onPress={() => void assign()}
          />
        </Card>
        {assignments.map((a) => (
          <Card key={a.id} style={styles.assignment}>
            <View style={{ flex: 1 }}>
              <Text style={styles.assignTitle}>{a.title}</Text>
              <Text style={styles.small}>
                {a.item_ids
                  .map((i) =>
                    i.startsWith('custom:')
                      ? `🎯 ${groupCustoms.find((g) => `custom:${g.id}` === i)?.title ?? '?'}`
                      : L(MINIGAMES.find((g) => g.id === i)?.title),
                  )
                  .join(' · ')}
              </Text>
            </View>
            <Button
              title="✕"
              tone="ghost"
              size="sm"
              onPress={() => {
                const c = db();
                if (c) void deleteAssignment(c, a.id).then(load);
              }}
            />
          </Card>
        ))}
      </Section>
      {msg && <Text style={styles.msg}>{msg}</Text>}
    </Screen>
  );
}

const styles = StyleSheet.create({
  codeCard: { flexDirection: 'row', gap: space.md, alignItems: 'center', flexWrap: 'wrap' },
  label: {
    fontFamily: fonts.bold,
    fontSize: 12,
    letterSpacing: 0.6,
    color: colors.muted,
    textTransform: 'uppercase',
  },
  code: { fontFamily: fonts.black, fontSize: 40, letterSpacing: 8, color: colors.primary },
  small: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted },
  qr: {
    padding: 10,
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  heatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  heatHead: { fontFamily: fonts.bold },
  heatName: { width: 150, padding: 10, fontFamily: fonts.medium, fontSize: 14, color: colors.text },
  heatCell: { width: 52, height: 44, alignItems: 'center', justifyContent: 'center' },
  heatValue: { fontFamily: fonts.bold, fontSize: 14, color: colors.text },
  heatCellText: {
    width: 52,
    textAlign: 'center',
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.primary,
  },
  action: { width: 36, textAlign: 'center', fontSize: 18, color: colors.orange },
  input: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 12,
    fontFamily: fonts.regular,
    fontSize: 16,
    backgroundColor: colors.bg,
  },
  pickRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  pick: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  pickText: { fontFamily: fonts.medium, fontSize: 13, color: colors.text },
  assignment: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 },
  assignTitle: { fontFamily: fonts.bold, fontSize: 15, color: colors.text },
  msg: { fontFamily: fonts.medium, fontSize: 14, color: colors.primary, marginTop: space.md },
});
