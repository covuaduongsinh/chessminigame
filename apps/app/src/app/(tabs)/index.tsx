import {
  getMiniGame,
  isUnlocked,
  LEVELS,
  levelProgress,
  MINIGAMES,
  miniGamesOf,
} from '@duongsinh/minigames';
import { type Assignment, listAssignments, myGroups } from '@duongsinh/sync';
import {
  Card,
  CheckerPattern,
  colors,
  fonts,
  LEVEL_COLORS,
  Logo,
  Piece,
  ProgressBar,
  Stars,
  space,
} from '@duongsinh/ui';
import { Link, router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { Screen, Section } from '@/components/Screen';
import { useLang } from '@/lib/i18n';
import { starsMap, useProgress, useSettings } from '@/lib/store';
import { db, useAccount } from '@/lib/sync';

export default function LearnScreen() {
  const { t, L } = useLang();
  const items = useProgress((s) => s.items);
  const nickname = useSettings((s) => s.nickname);
  const account = useAccount();
  const stars = useMemo(() => starsMap(items), [items]);
  const { width } = useWindowDimensions();
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  const next = MINIGAMES.find((g) => isUnlocked(g.id, stars) && !(stars[g.id] ?? 0));

  useEffect(() => {
    const c = db();
    if (!c || account.status !== 'ready' || !account.profile) return;
    let alive = true;
    void (async () => {
      try {
        const groups = await myGroups(c, account.profile!.id);
        const lists = await Promise.all(groups.map((g) => listAssignments(c, g.id)));
        if (alive) setAssignments(lists.flat().slice(0, 6));
      } catch {
        // ngoại tuyến: bỏ qua
      }
    })();
    return () => {
      alive = false;
    };
  }, [account.status, account.profile]);

  const tileWidth = width >= 900 ? 150 : width >= 600 ? 140 : (Math.min(width, 1100) - 32 - 24) / 3;

  return (
    <Screen testID="screen-learn">
      <View style={styles.hero}>
        <CheckerPattern width={Math.min(width, 1100)} height={170} opacity={0.07} />
        <View
          style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <Logo size={44} />
          <Link href="/cai-dat" asChild>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('common.settings')}
              style={styles.gear}
              testID="open-settings"
            >
              <Text style={{ fontSize: 22 }}>⚙️</Text>
            </Pressable>
          </Link>
        </View>
        <Text style={styles.hello}>{t('learn.hello', { name: nickname ?? '' })}</Text>
        <Text style={styles.sub}>{t('learn.subtitle')}</Text>
        {next ? (
          <Pressable
            style={styles.cta}
            onPress={() => router.push(`/minigame/${next.id}`)}
            testID="continue"
            accessibilityRole="button"
          >
            <Piece type={LEVELS.find((l) => l.key === next.level)!.piece} color="b" size={34} />
            <View style={{ flex: 1 }}>
              <Text style={styles.ctaLabel}>{t('learn.continue')}</Text>
              <Text style={styles.ctaTitle}>{L(next.title)}</Text>
            </View>
            <Text style={styles.ctaArrow}>›</Text>
          </Pressable>
        ) : (
          <Text style={styles.sub}>{t('learn.allDone')}</Text>
        )}
      </View>

      {assignments.length > 0 && (
        <Section title={t('learn.assignments')}>
          {assignments.map((a) => (
            <Card key={a.id} style={{ gap: 6 }}>
              <Text style={styles.cardTitle}>{a.title}</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {a.item_ids.map((id) => {
                  const g = getMiniGame(id);
                  if (!g) return null;
                  return (
                    <Pressable
                      key={id}
                      onPress={() => router.push(`/minigame/${id}`)}
                      style={styles.assignChip}
                    >
                      <Text style={styles.assignText}>{L(g.title)}</Text>
                      <Stars value={stars[id] ?? 0} size={12} />
                    </Pressable>
                  );
                })}
              </View>
            </Card>
          ))}
        </Section>
      )}

      <Section title={t('learn.path')}>
        {LEVELS.map((level) => {
          const games = miniGamesOf(level.key);
          const p = levelProgress(level.key, stars);
          const color = LEVEL_COLORS[level.key] ?? colors.primary;
          return (
            <Card
              key={level.key}
              style={[styles.level, { borderLeftColor: color }]}
              testID={`level-${level.key}`}
            >
              <View style={styles.levelHead}>
                <View style={[styles.levelIcon, { backgroundColor: `${color}22` }]}>
                  <Piece type={level.piece} color="b" size={44} />
                </View>
                <View style={{ flex: 1, gap: 4 }}>
                  <Text style={styles.levelName}>
                    {level.index}. {L(level.name)}
                  </Text>
                  <Text style={styles.levelDesc}>{L(level.description)}</Text>
                  <ProgressBar value={p.earned / p.total} color={color} />
                  <Text style={styles.levelMeta}>
                    {t('learn.progress', {
                      done: p.completed,
                      total: p.count,
                      stars: p.earned,
                      maxStars: p.total,
                    })}
                  </Text>
                </View>
              </View>
              <View style={styles.tiles}>
                {games.map((g) => {
                  const unlocked = isUnlocked(g.id, stars);
                  const s = stars[g.id] ?? 0;
                  return (
                    <Pressable
                      key={g.id}
                      testID={`game-${g.id}`}
                      accessibilityRole="button"
                      accessibilityLabel={L(g.title)}
                      accessibilityHint={unlocked ? undefined : t('common.locked')}
                      disabled={!unlocked}
                      onPress={() => router.push(`/minigame/${g.id}`)}
                      style={({ pressed }) => [
                        styles.tile,
                        { width: tileWidth },
                        !unlocked && styles.tileLocked,
                        s > 0 && { borderColor: color, backgroundColor: `${color}12` },
                        pressed && { transform: [{ scale: 0.97 }] },
                      ]}
                    >
                      <Text style={[styles.tileNum, { color }]}>{unlocked ? g.order : '🔒'}</Text>
                      <Text style={styles.tileTitle} numberOfLines={2}>
                        {L(g.title)}
                      </Text>
                      <Stars value={s} size={14} />
                    </Pressable>
                  );
                })}
              </View>
            </Card>
          );
        })}
      </Section>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: space.lg,
    gap: 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  gear: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hello: { fontFamily: fonts.black, fontSize: 26, color: colors.primary, marginTop: space.md },
  sub: { fontFamily: fonts.regular, fontSize: 16, color: colors.muted },
  cta: {
    marginTop: space.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.goldLight,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: colors.gold,
  },
  ctaLabel: {
    fontFamily: fonts.bold,
    fontSize: 12,
    color: colors.orange,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  ctaTitle: { fontFamily: fonts.bold, fontSize: 18, color: colors.text },
  ctaArrow: { fontFamily: fonts.bold, fontSize: 32, color: colors.orange },
  cardTitle: { fontFamily: fonts.bold, fontSize: 16, color: colors.text },
  assignChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: colors.primaryLight,
  },
  assignText: { fontFamily: fonts.medium, fontSize: 13, color: colors.primary },
  level: { borderLeftWidth: 6, gap: space.md },
  levelHead: { flexDirection: 'row', gap: space.md, alignItems: 'center' },
  levelIcon: {
    width: 64,
    height: 64,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelName: { fontFamily: fonts.black, fontSize: 20, color: colors.primary },
  levelDesc: { fontFamily: fonts.regular, fontSize: 14, color: colors.muted },
  levelMeta: { fontFamily: fonts.medium, fontSize: 12, color: colors.muted },
  tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  tile: {
    minHeight: 104,
    padding: 10,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.white,
    gap: 4,
    justifyContent: 'space-between',
  },
  tileLocked: { opacity: 0.45 },
  tileNum: { fontFamily: fonts.black, fontSize: 18 },
  tileTitle: { fontFamily: fonts.bold, fontSize: 14, color: colors.text, lineHeight: 18 },
});
