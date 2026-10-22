import { parsePgn, Position, type Square, squareName } from '@duongsinh/chess-core';
import { CLASSICS } from '@duongsinh/minigames';
import { Board, Button, boardTheme, Card, colors, fonts, space } from '@duongsinh/ui';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { MoveList } from '@/components/MoveList';
import { Screen } from '@/components/Screen';
import { useBoardSize, useIsWide } from '@/lib/hooks';
import { useLang } from '@/lib/i18n';
import { play } from '@/lib/sound';
import { useSettings } from '@/lib/store';

export default function ClassicScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, L } = useLang();
  const settings = useSettings();
  const size = useBoardSize();
  const isWide = useIsWide();
  const classic = CLASSICS.find((c) => c.id === id);
  const game = useMemo(() => (classic ? parsePgn(classic.pgn) : null), [classic]);
  const [ply, setPly] = useState(0);
  const [auto, setAuto] = useState(false);

  useEffect(() => {
    if (!auto || !game) return;
    if (ply >= game.moves.length) {
      setAuto(false);
      return;
    }
    const tm = setTimeout(() => {
      setPly((p) => p + 1);
      play('move');
    }, 1300);
    return () => clearTimeout(tm);
  }, [auto, ply, game]);

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined' || !game) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') setPly((p) => Math.max(0, p - 1));
      if (e.key === 'ArrowRight') setPly((p) => Math.min(game.moves.length, p + 1));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [game]);

  if (!classic || !game) {
    return (
      <Screen back title="404">
        <Text>{id}</Text>
      </Screen>
    );
  }
  const fen = ply === 0 ? game.startFen : game.moves[ply - 1]!.fenAfter;
  const pos = Position.fromFen(fen);
  const k = pos.kings[pos.side] ?? -1;
  const last = ply > 0 ? game.moves[ply - 1]! : null;
  const note = classic.notes[ply];

  return (
    <Screen back title={L(classic.title)} subtitle={`${classic.white} – ${classic.black}${classic.year ? ` · ${classic.event} ${classic.year}` : ''}`} testID="screen-classic">
      <View style={[styles.layout, isWide && { flexDirection: 'row', alignItems: 'flex-start' }]}>
        <View style={{ alignItems: 'center', gap: 8 }}>
          <Board
            fen={fen}
            size={size}
            theme={boardTheme(settings.boardTheme)}
            showCoords={settings.coords}
            lastMove={last ? { from: last.uci.slice(0, 2) as Square, to: last.uci.slice(2, 4) as Square } : null}
            check={k !== -1 && pos.inCheck() ? squareName(k) : null}
          />
          <View style={styles.nav}>
            <Button title="⏮" tone="ghost" size="sm" onPress={() => setPly(0)} />
            <Button title="◀" tone="ghost" size="sm" onPress={() => setPly((p) => Math.max(0, p - 1))} />
            <Button title={auto ? '⏸' : '▶︎ Auto'} tone={auto ? 'accent' : 'primary'} size="sm" onPress={() => setAuto((a) => !a)} />
            <Button title="▶" tone="ghost" size="sm" onPress={() => setPly((p) => Math.min(game.moves.length, p + 1))} testID="classic-next" />
            <Button title="⏭" tone="ghost" size="sm" onPress={() => setPly(game.moves.length)} />
          </View>
        </View>
        <View style={[styles.side, isWide && { width: 380 }]}>
          <Card style={{ gap: 6 }}>
            <Text style={styles.intro}>{L(classic.intro)}</Text>
          </Card>
          {note && (
            <Card style={{ backgroundColor: colors.goldLight, borderColor: colors.gold }}>
              <Text style={styles.note} testID="classic-note">
                💬 {L(note)}
              </Text>
            </Card>
          )}
          <MoveList sans={game.moves.map((m) => m.san)} current={ply} onSelect={setPly} maxHeight={260} />
          {ply === game.moves.length && <Text style={styles.result}>{t('online.result', { result: game.result })}</Text>}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  layout: { gap: space.md },
  side: { gap: space.sm, flexShrink: 1, width: '100%' },
  nav: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', justifyContent: 'center' },
  intro: { fontFamily: fonts.regular, fontSize: 15, color: colors.text, lineHeight: 22 },
  note: { fontFamily: fonts.medium, fontSize: 15, color: colors.text, lineHeight: 22 },
  result: { fontFamily: fonts.bold, fontSize: 16, color: colors.primary },
});
