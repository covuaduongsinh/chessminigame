import { Position } from '@duongsinh/chess-core';
import { ENDGAMES } from '@duongsinh/minigames';
import { Board, Card, colors, fonts, space, Stars } from '@duongsinh/ui';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { useLang } from '@/lib/i18n';
import { useProgress } from '@/lib/store';

export default function EndgamesScreen() {
  const { t, L } = useLang();
  const items = useProgress((s) => s.items);
  const { width } = useWindowDimensions();
  const cols = width >= 1100 ? 3 : width >= 700 ? 2 : 1;
  const cardW = (Math.min(width, 1100) - 32 - (cols - 1) * 12) / cols;
  return (
    <Screen title={t('endgames.title')} subtitle={t('endgames.subtitle')} testID="screen-endgames">
      <View style={styles.grid}>
        {ENDGAMES.map((e) => {
          const s = items[`eg:${e.id}`]?.stars ?? 0;
          const turn = Position.fromFen(e.round.fen).turn;
          return (
            <Pressable key={e.id} onPress={() => router.push(`/tan-cuoc/${e.id}`)} testID={`eg-${e.id}`} style={{ width: cardW }}>
              <Card style={styles.card}>
                <Board fen={e.round.fen} size={96} showCoords={false} orientation={turn} />
                <View style={{ flex: 1, gap: 4 }}>
                  <Text style={styles.title}>{L(e.title)}</Text>
                  <Text style={styles.desc} numberOfLines={3}>
                    {L(e.description)}
                  </Text>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={styles.diff}>
                      {t('endgames.difficulty')}: {'●'.repeat(e.difficulty)}
                      {'○'.repeat(3 - e.difficulty)}
                    </Text>
                    <Stars value={s} size={14} />
                  </View>
                </View>
              </Card>
            </Pressable>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: { flexDirection: 'row', gap: space.md, alignItems: 'center' },
  title: { fontFamily: fonts.bold, fontSize: 16, color: colors.primary },
  desc: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted, lineHeight: 18 },
  diff: { fontFamily: fonts.medium, fontSize: 12, color: colors.orange },
});
