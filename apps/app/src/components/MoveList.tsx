import { Card, colors, fonts } from '@duongsinh/ui';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLang } from '@/lib/i18n';

/** Danh sách nước đi dạng "1. e4 e5". `current` = số ply đang xem (để tô sáng). */
export function MoveList({
  sans,
  current,
  onSelect,
  startPly = 0,
  maxHeight = 180,
}: {
  sans: string[];
  current?: number;
  onSelect?: (ply: number) => void;
  startPly?: number;
  maxHeight?: number;
}) {
  const { t } = useLang();
  const rows: Array<{
    num: number;
    white?: { san: string; ply: number };
    black?: { san: string; ply: number };
  }> = [];
  sans.forEach((san, i) => {
    const ply = startPly + i + 1;
    const num = Math.ceil(ply / 2);
    const isWhite = ply % 2 === 1;
    let row = rows[rows.length - 1];
    if (!row || row.num !== num) {
      row = { num };
      rows.push(row);
    }
    if (isWhite) row.white = { san, ply: i + 1 };
    else row.black = { san, ply: i + 1 };
  });
  const cell = (m?: { san: string; ply: number }) =>
    m ? (
      <Pressable
        onPress={() => onSelect?.(m.ply)}
        style={[styles.cell, current === m.ply && styles.cellOn]}
      >
        <Text style={styles.san}>{m.san}</Text>
      </Pressable>
    ) : (
      <View style={styles.cell} />
    );
  return (
    <Card style={{ padding: 10 }}>
      {sans.length === 0 ? (
        <Text style={styles.empty}>{t('analysis.noMoves')}</Text>
      ) : (
        <ScrollView style={{ maxHeight }}>
          {rows.map((r) => (
            <View key={r.num} style={styles.row}>
              <Text style={styles.num}>{r.num}.</Text>
              {cell(r.white)}
              {cell(r.black)}
            </View>
          ))}
        </ScrollView>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  num: { width: 34, fontFamily: fonts.medium, fontSize: 13, color: colors.muted },
  cell: { flex: 1, paddingVertical: 3, paddingHorizontal: 6, borderRadius: 6 },
  cellOn: { backgroundColor: colors.goldLight },
  san: { fontFamily: fonts.bold, fontSize: 14, color: colors.text },
  empty: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted },
});
