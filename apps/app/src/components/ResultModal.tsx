import { Button, colors, fonts, Stars } from '@duongsinh/ui';
import { Modal, StyleSheet, Text, View } from 'react-native';

export function ResultModal({
  visible,
  title,
  text,
  stars,
  primary,
  secondary,
}: {
  visible: boolean;
  title: string;
  text?: string;
  stars?: number;
  primary: { title: string; onPress: () => void };
  secondary?: { title: string; onPress: () => void };
}) {
  if (!visible) return null;
  return (
    <Modal transparent animationType="fade" onRequestClose={secondary?.onPress ?? primary.onPress}>
      <View style={styles.backdrop}>
        <View style={styles.card} testID="result-modal">
          {stars !== undefined && <Stars value={stars} size={44} />}
          <Text style={styles.title}>{title}</Text>
          {text ? <Text style={styles.text}>{text}</Text> : null}
          <View style={styles.row}>
            {secondary && (
              <Button title={secondary.title} tone="ghost" onPress={secondary.onPress} />
            )}
            <Button
              title={primary.title}
              tone="accent"
              onPress={primary.onPress}
              testID="result-primary"
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(26,26,46,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 28,
    gap: 14,
    alignItems: 'center',
    maxWidth: 420,
    width: '100%',
    borderTopWidth: 6,
    borderTopColor: colors.gold,
  },
  title: { fontFamily: fonts.black, fontSize: 26, color: colors.primary, textAlign: 'center' },
  text: {
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 23,
  },
  row: { flexDirection: 'row', gap: 10, marginTop: 6, flexWrap: 'wrap', justifyContent: 'center' },
});
