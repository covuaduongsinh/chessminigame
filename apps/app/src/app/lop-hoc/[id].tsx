import { getMiniGame, nextMiniGame } from '@duongsinh/minigames';
import { colors, fonts } from '@duongsinh/ui';
import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text } from 'react-native';
import { MiniGamePlayer } from '@/components/MiniGamePlayer';
import { Screen } from '@/components/Screen';
import { useLang } from '@/lib/i18n';

/** Chế độ lớp học: bàn cờ cỡ lớn, HLV trình diễn từng bước bằng bàn phím hoặc nút bấm. */
export default function ClassroomScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { L } = useLang();
  const def = getMiniGame(String(id));
  if (!def) {
    return (
      <Screen back title="404">
        <Text>{id}</Text>
      </Screen>
    );
  }
  const next = nextMiniGame(def.id);
  return (
    <Screen back title={L(def.title)} maxWidth={1600} testID="screen-classroom">
      <Text style={styles.story}>{L(def.story)}</Text>
      <MiniGamePlayer
        key={def.id}
        def={def}
        classroom
        itemId={`class:${def.id}`}
        onNext={next ? () => router.replace(`/lop-hoc/${next.id}`) : undefined}
        onExit={() => router.replace('/lop-hoc')}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  story: { fontFamily: fonts.regular, fontSize: 18, lineHeight: 26, color: colors.text, marginBottom: 12 },
});
