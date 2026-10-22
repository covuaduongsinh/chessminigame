import { getMiniGame, LEVELS, nextMiniGame } from '@duongsinh/minigames';
import { Pill } from '@duongsinh/ui';
import { router, useLocalSearchParams } from 'expo-router';
import { Text } from 'react-native';
import { MiniGamePlayer } from '@/components/MiniGamePlayer';
import { Screen } from '@/components/Screen';
import { useLang } from '@/lib/i18n';

export default function MiniGameScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { L } = useLang();
  const def = getMiniGame(String(id));
  if (!def) {
    return (
      <Screen back title="404">
        <Text>Không tìm thấy bài {id}</Text>
      </Screen>
    );
  }
  const level = LEVELS.find((l) => l.key === def.level)!;
  const next = nextMiniGame(def.id);
  return (
    <Screen
      back
      title={L(def.title)}
      right={<Pill text={L(level.name)} />}
      testID="screen-minigame"
    >
      <MiniGamePlayer
        key={def.id}
        def={def}
        onNext={next ? () => router.replace(`/minigame/${next.id}`) : undefined}
        onExit={() => router.replace('/')}
      />
    </Screen>
  );
}
