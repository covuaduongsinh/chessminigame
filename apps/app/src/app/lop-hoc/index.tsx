import { LEVELS, miniGamesOf } from '@duongsinh/minigames';
import { Card, colors, fonts, LEVEL_COLORS, Piece, space } from '@duongsinh/ui';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { useLang } from '@/lib/i18n';

export default function ClassroomPicker() {
  const { t, L } = useLang();
  return (
    <Screen
      back
      title={t('classroom.title')}
      subtitle={t('classroom.subtitle')}
      testID="screen-classroom-pick"
    >
      <Text style={styles.keys}>{t('classroom.keys')}</Text>
      {LEVELS.map((l) => (
        <Card
          key={l.key}
          style={{
            gap: 10,
            marginTop: space.md,
            borderLeftWidth: 6,
            borderLeftColor: LEVEL_COLORS[l.key],
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Piece type={l.piece} color="b" size={32} />
            <Text style={styles.level}>{L(l.name)}</Text>
          </View>
          <View style={styles.row}>
            {miniGamesOf(l.key).map((g) => (
              <Pressable
                key={g.id}
                onPress={() => router.push(`/lop-hoc/${g.id}`)}
                style={styles.item}
                testID={`class-${g.id}`}
              >
                <Text style={styles.itemText}>
                  {g.order}. {L(g.title)}
                </Text>
              </Pressable>
            ))}
          </View>
        </Card>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  keys: { fontFamily: fonts.regular, fontSize: 14, color: colors.muted },
  level: { fontFamily: fonts.black, fontSize: 18, color: colors.primary },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  item: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
  },
  itemText: { fontFamily: fonts.bold, fontSize: 15, color: colors.primary },
});
