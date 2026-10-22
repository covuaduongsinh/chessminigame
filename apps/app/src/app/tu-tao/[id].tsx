import { type MiniGame, parseCustomGame } from '@duongsinh/minigames';
import { getCustomGame } from '@duongsinh/sync';
import { colors } from '@duongsinh/ui';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text } from 'react-native';
import { MiniGamePlayer } from '@/components/MiniGamePlayer';
import { Screen } from '@/components/Screen';
import { useCustomGames } from '@/lib/customStore';
import { useLang } from '@/lib/i18n';
import { db } from '@/lib/sync';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Chơi mini-game do HLV tự tạo: lấy trên máy trước, nếu không có thì tải bản được chia sẻ trong nhóm. */
export default function CustomGameScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, L } = useLang();
  const key = String(id);
  const local = useCustomGames(
    (s) =>
      s.items[key] ?? Object.values(s.items).find((g) => Object.values(g.shared).includes(key)),
  );
  const [remote, setRemote] = useState<MiniGame | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (local || !UUID.test(key)) return;
    const c = db();
    if (!c) {
      setFailed(true);
      return;
    }
    getCustomGame(c, key)
      .then((row) => {
        const def = parseCustomGame(row.def);
        if (def) setRemote({ ...def, id: row.id, title: { vi: row.title, en: row.title } });
        else setFailed(true);
      })
      .catch(() => setFailed(true));
  }, [key, local]);

  const def = local?.def ?? remote;
  if (!def) {
    return (
      <Screen back title="…">
        {failed || !UUID.test(key) ? (
          <Text>{t('custom.notFound')}</Text>
        ) : (
          <ActivityIndicator color={colors.primary} />
        )}
      </Screen>
    );
  }
  return (
    <Screen back title={L(def.title)} testID="screen-custom">
      <MiniGamePlayer
        key={def.id}
        def={def}
        itemId={`custom:${UUID.test(key) ? key : def.id}`}
        onExit={() => router.back()}
      />
    </Screen>
  );
}
