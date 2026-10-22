import { ENDGAMES } from '@duongsinh/minigames';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { Text } from 'react-native';
import { MiniGamePlayer } from '@/components/MiniGamePlayer';
import { Screen } from '@/components/Screen';
import { endgameAsMiniGame } from '@/lib/endgames';
import { useLang } from '@/lib/i18n';

export default function EndgameScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { L } = useLang();
  const def = useMemo(() => endgameAsMiniGame(String(id)), [id]);
  if (!def) {
    return (
      <Screen back title="404">
        <Text>{id}</Text>
      </Screen>
    );
  }
  const idx = ENDGAMES.findIndex((e) => e.id === def.id);
  const next = ENDGAMES[idx + 1];
  return (
    <Screen back title={L(def.title)} testID="screen-endgame">
      <MiniGamePlayer
        key={def.id}
        def={def}
        itemId={`eg:${def.id}`}
        onNext={next ? () => router.replace(`/tan-cuoc/${next.id}`) : undefined}
        onExit={() => router.replace('/tan-cuoc')}
      />
    </Screen>
  );
}
