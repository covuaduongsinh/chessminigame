import {
  createGame,
  type GameRow,
  groupMembers,
  joinGroup,
  listGames,
  type Member,
  type MyGroup,
  myGroups,
  respondGame,
  subscribeGroupGames,
} from '@duongsinh/sync';
import { Button, Card, colors, fonts, Piece, Pill, space } from '@duongsinh/ui';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, View } from 'react-native';
import { Screen, Section } from '@/components/Screen';
import { useLang } from '@/lib/i18n';
import { db, useAccount } from '@/lib/sync';

interface GroupView {
  group: MyGroup;
  members: Member[];
  games: GameRow[];
}

export default function ClubScreen() {
  const { t } = useLang();
  const params = useLocalSearchParams<{ code?: string }>();
  const account = useAccount();
  const [code, setCode] = useState(params.code ?? '');
  const [groups, setGroups] = useState<GroupView[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const me = account.profile;

  const load = useCallback(async () => {
    const c = db();
    if (!c || !me) return;
    setLoading(true);
    try {
      const gs = await myGroups(c, me.id);
      const views = await Promise.all(
        gs.map(async (g) => ({
          group: g,
          members: await groupMembers(c, g.id),
          games: await listGames(c, g.id),
        })),
      );
      setGroups(views);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [me]);

  useEffect(() => {
    void load();
  }, [load]);

  // Cập nhật lời mời/ván mới theo thời gian thực (đăng ký lại khi danh sách nhóm đổi).
  const groupKey = groups.map((g) => g.group.id).join(',');
  // biome-ignore lint/correctness/useExhaustiveDependencies: chỉ phụ thuộc danh sách id nhóm
  useEffect(() => {
    const c = db();
    if (!c) return;
    const unsubs = groups.map((g) => subscribeGroupGames(c, g.group.id, () => void load()));
    return () => {
      for (const u of unsubs) u();
    };
  }, [groupKey]);

  const join = async () => {
    const c = db();
    if (!c || code.trim().length < 6) return;
    try {
      await joinGroup(c, code);
      setCode('');
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  const invite = async (groupId: string, opponent: string) => {
    const c = db();
    if (!c) return;
    try {
      const g = await createGame(c, groupId, opponent, Math.random() < 0.5 ? 'w' : 'b');
      await load();
      router.push(`/game/${g.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  const respond = async (gameId: string, accept: boolean) => {
    const c = db();
    if (!c) return;
    try {
      await respondGame(c, gameId, accept);
      if (accept) router.push(`/game/${gameId}`);
      else await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  const nameOf = (view: GroupView, id: string) =>
    view.members.find((m) => m.user_id === id)?.nickname ?? '?';

  return (
    <Screen title={t('club.title')} subtitle={t('club.subtitle')} testID="screen-club">
      <Card style={styles.me}>
        <Piece type={(me?.avatar ?? 'p') as 'p'} color="b" size={48} />
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>{t('club.you')}</Text>
          <Text style={styles.name} testID="my-nickname">
            {me?.nickname ?? '…'}
          </Text>
        </View>
        {account.status === 'connecting' && <ActivityIndicator color={colors.primary} />}
        <Button title="⚙️" tone="ghost" size="sm" onPress={() => router.push('/cai-dat')} />
      </Card>

      {account.status !== 'ready' ? (
        <Card style={{ gap: 10, marginTop: space.md }}>
          <Text style={styles.text}>
            {account.status === 'connecting' ? t('club.connecting') : t('club.notConfigured')}
          </Text>
          {account.error ? <Text style={styles.error}>{account.error}</Text> : null}
          {account.status !== 'connecting' && (
            <Button
              title={t('common.retry')}
              tone="light"
              size="sm"
              onPress={() => void account.connect()}
            />
          )}
        </Card>
      ) : (
        <>
          <Section title={t('club.join')}>
            <Card style={styles.joinRow}>
              <TextInput
                value={code}
                onChangeText={(v) => setCode(v.toUpperCase())}
                placeholder={t('club.joinCode')}
                autoCapitalize="characters"
                maxLength={6}
                style={styles.input}
                testID="join-code"
              />
              <Button
                title={t('club.join')}
                onPress={() => void join()}
                disabled={code.trim().length < 6}
              />
            </Card>
          </Section>

          <Section
            title={t('club.myGroups')}
            right={loading ? <ActivityIndicator color={colors.primary} /> : undefined}
          >
            {groups.length === 0 && !loading && (
              <Text style={styles.text}>{t('club.noGroups')}</Text>
            )}
            {groups.map((view) => {
              const others = view.members.filter((m) => m.user_id !== me?.id);
              const invites = view.games.filter((g) => g.status === 'waiting');
              const active = view.games.filter((g) => g.status === 'active');
              const done = view.games.filter((g) => g.status === 'finished').slice(0, 5);
              return (
                <Card key={view.group.id} style={{ gap: 12 }}>
                  <View
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}
                  >
                    <Text style={styles.groupName}>{view.group.name}</Text>
                    <Pill text={t(`coach.kind.${view.group.kind}`)} />
                    {view.group.myRole !== 'member' && (
                      <Button
                        title={t('club.coachOpen')}
                        tone="light"
                        size="sm"
                        onPress={() => router.push(`/hlv/${view.group.id}`)}
                      />
                    )}
                  </View>

                  {invites.map((g) => {
                    const mine = g.created_by === me?.id;
                    const other =
                      g.created_by === me?.id
                        ? g.white_id === me?.id
                          ? g.black_id
                          : g.white_id
                        : g.created_by;
                    return (
                      <View key={g.id} style={styles.invite}>
                        <Text style={[styles.text, { flex: 1 }]}>
                          {mine
                            ? `⏳ ${nameOf(view, other)} — ${t('club.waiting')}`
                            : `🎉 ${t('club.invited', { name: nameOf(view, other) })}`}
                        </Text>
                        {!mine && (
                          <>
                            <Button
                              title={t('club.accept')}
                              tone="success"
                              size="sm"
                              onPress={() => void respond(g.id, true)}
                            />
                            <Button
                              title={t('club.decline')}
                              tone="ghost"
                              size="sm"
                              onPress={() => void respond(g.id, false)}
                            />
                          </>
                        )}
                      </View>
                    );
                  })}

                  {active.map((g) => (
                    <View key={g.id} style={styles.invite}>
                      <Text style={[styles.text, { flex: 1 }]}>
                        ♟ {nameOf(view, g.white_id)} – {nameOf(view, g.black_id)} ·{' '}
                        {t('club.active')}
                      </Text>
                      <Button
                        title={t('club.open')}
                        size="sm"
                        onPress={() => router.push(`/game/${g.id}`)}
                      />
                    </View>
                  ))}

                  <Text style={styles.label}>{t('club.members')}</Text>
                  <View style={styles.members}>
                    {others.map((m) => (
                      <View key={m.user_id} style={styles.member}>
                        <Piece type={m.avatar as 'p'} color="w" size={28} />
                        <Text style={styles.memberName} numberOfLines={1}>
                          {m.nickname}
                        </Text>
                        <Button
                          title={t('club.invite')}
                          tone="light"
                          size="sm"
                          onPress={() => void invite(view.group.id, m.user_id)}
                        />
                      </View>
                    ))}
                  </View>

                  {done.length > 0 && (
                    <>
                      <Text style={styles.label}>{t('club.finished')}</Text>
                      {done.map((g) => (
                        <Text
                          key={g.id}
                          style={styles.small}
                          onPress={() => router.push(`/game/${g.id}`)}
                        >
                          {nameOf(view, g.white_id)} – {nameOf(view, g.black_id)}: {g.result}
                        </Text>
                      ))}
                    </>
                  )}
                </Card>
              );
            })}
          </Section>
        </>
      )}

      {error && (
        <Text style={[styles.error, { marginTop: space.md }]}>
          {t('club.error', { message: error })}
        </Text>
      )}

      <Section title={t('club.coach')}>
        <Card style={{ gap: 10 }}>
          <Text style={styles.text}>{t('coach.share')}</Text>
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
            <Button
              title={t('club.coachOpen')}
              onPress={() => router.push('/hlv')}
              testID="open-coach"
            />
            <Button
              title={t('classroom.title')}
              tone="ghost"
              onPress={() => router.push('/lop-hoc')}
              testID="open-classroom"
            />
          </View>
        </Card>
      </Section>
    </Screen>
  );
}

const styles = StyleSheet.create({
  me: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  label: {
    fontFamily: fonts.bold,
    fontSize: 12,
    letterSpacing: 0.6,
    color: colors.muted,
    textTransform: 'uppercase',
  },
  name: { fontFamily: fonts.black, fontSize: 20, color: colors.primary },
  text: { fontFamily: fonts.regular, fontSize: 15, color: colors.text, lineHeight: 21 },
  small: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted },
  error: { fontFamily: fonts.medium, fontSize: 14, color: colors.red },
  joinRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  input: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontFamily: fonts.black,
    fontSize: 20,
    letterSpacing: 4,
    color: colors.primary,
    backgroundColor: colors.bg,
  },
  groupName: { fontFamily: fonts.black, fontSize: 18, color: colors.text },
  invite: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 12,
    backgroundColor: colors.goldLight,
    flexWrap: 'wrap',
  },
  members: { gap: 6 },
  member: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  memberName: { flex: 1, fontFamily: fonts.medium, fontSize: 15, color: colors.text },
});
