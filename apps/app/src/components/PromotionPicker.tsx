import type { Color, PieceType } from '@duongsinh/chess-core';
import { colors, fonts, Piece } from '@duongsinh/ui';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useLang } from '@/lib/i18n';

export function PromotionPicker({
  color,
  onPick,
  onCancel,
}: {
  color: Color;
  onPick: (p: PieceType) => void;
  onCancel: () => void;
}) {
  const { t } = useLang();
  return (
    <Modal transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable style={styles.backdrop} onPress={onCancel}>
        <View style={styles.card}>
          <Text style={styles.title}>{t('game.promote')}</Text>
          <View style={styles.row}>
            {(['q', 'r', 'b', 'n'] as const).map((p) => (
              <Pressable
                key={p}
                accessibilityRole="button"
                accessibilityLabel={p}
                testID={`promo-${p}`}
                onPress={() => onPick(p)}
                style={({ pressed }) => [styles.option, pressed && { backgroundColor: colors.goldLight }]}
              >
                <Piece type={p} color={color} size={64} />
              </Pressable>
            ))}
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(26,26,46,0.45)', alignItems: 'center', justifyContent: 'center' },
  card: { backgroundColor: colors.white, borderRadius: 20, padding: 20, gap: 12, alignItems: 'center' },
  title: { fontFamily: fonts.bold, fontSize: 18, color: colors.primary },
  row: { flexDirection: 'row', gap: 10 },
  option: { padding: 6, borderRadius: 14, borderWidth: 1.5, borderColor: colors.border },
});
