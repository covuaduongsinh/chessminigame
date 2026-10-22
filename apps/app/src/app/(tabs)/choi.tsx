import { type Color, Game, type PieceType, type Square, squareName } from '@duongsinh/chess-core';
import { hint as engineHint, getLevel, LEVELS, thinkAsync } from '@duongsinh/engine';
import {
  type Arrow,
  Board,
  Button,
  boardTheme,
  Card,
  colors,
  fonts,
  Piece,
  space,
} from '@duongsinh/ui';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MoveList } from '@/components/MoveList';
import { PromotionPicker } from '@/components/PromotionPicker';
import { ResultModal } from '@/components/ResultModal';
import { Screen } from '@/components/Screen';
import { useBoardSize, useIsWide } from '@/lib/hooks';
import { useLang } from '@/lib/i18n';
import { play } from '@/lib/sound';
import { useProgress, useSettings } from '@/lib/store';

const LEVEL_PIECES: PieceType[] = ['p', 'n', 'b', 'r', 'q', 'k'];

export default function PlayScreen() {
  const { t, L } = useLang();
  const settings = useSettings();
  const recordGame = useProgress((s) => s.recordGame);
  const stats = useProgress((s) => s.playStats);
  const size = useBoardSize();
  const isWide = useIsWide();
  const [level, setLevel] = useState(1);
  const [myColor, setMyColor] = useState<Color>('w');
  const [game, setGame] = useState(() => new Game());
  const [, setTick] = useState(0);
  const [busy, setBusy] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [hintArrow, setHintArrow] = useState<Arrow | null>(null);
  const [promo, setPromo] = useState<{ from: Square; to: Square } | null>(null);
  const [over, setOver] = useState<{ title: string; text: string } | null>(null);
  const token = useRef(0);
  const levelRef = useRef(level);
  levelRef.current = level;
  const rerender = useCallback(() => setTick((x) => x + 1), []);

  const finishIfOver = useCallback(
    (g: Game) => {
      const o = g.outcome();
      if (!o) return false;
      let result: 'w' | 'd' | 'l';
      let title: string;
      let text: string;
      if (o.kind === 'checkmate') {
        result = o.winner === myColor ? 'w' : 'l';
        title = result === 'w' ? t('play.youWin') : t('play.youLose');
        text = t('play.checkmate');
      } else {
        result = 'd';
        title = t('play.draw');
        text = t(`play.${o.kind === 'fifty-move' ? 'fifty' : o.kind}`);
      }
      recordGame(level, result);
      play(result === 'w' ? 'win' : 'move');
      setOver({ title, text });
      return true;
    },
    [level, myColor, recordGame, t],
  );

  const engineTurn = useCallback(
    async (g: Game) => {
      if (g.turn === myColor || g.outcome()) return;
      const my = ++token.current;
      setBusy(true);
      const m = await thinkAsync(g.position.clone(), levelRef.current, { minDelayMs: 450 });
      if (my !== token.current) return; // ván đã đổi
      if (m) {
        const e = g.apply(m);
        play(e.captured ? 'capture' : e.san.includes('+') ? 'check' : 'move');
      }
      setBusy(false);
      rerender();
      finishIfOver(g);
    },
    [finishIfOver, myColor, rerender],
  );

  const newGame = useCallback(
    (color: Color = myColor) => {
      token.current++;
      const g = new Game();
      setGame(g);
      setOver(null);
      setHintArrow(null);
      setBusy(false);
      setFlipped(false);
      if (color === 'b') void engineTurn(g);
    },
    [engineTurn, myColor],
  );

  // Khi đổi màu quân: bắt đầu ván mới.
  // biome-ignore lint/correctness/useExhaustiveDependencies: chỉ chạy khi đổi màu quân
  useEffect(() => {
    newGame(myColor);
  }, [myColor]);

  const doMove = (from: Square, to: Square, promotion?: PieceType) => {
    const e = game.move({ from, to, promotion });
    if (!e) {
      play('wrong');
      return;
    }
    play(e.captured ? 'capture' : e.san.includes('+') ? 'check' : 'move');
    setHintArrow(null);
    rerender();
    if (!finishIfOver(game)) void engineTurn(game);
  };

  const onMove = (from: Square, to: Square) => {
    if (busy || over) return;
    if (game.isPromotion(from, to)) setPromo({ from, to });
    else doMove(from, to);
  };

  const undo = () => {
    token.current++;
    setBusy(false);
    game.undo();
    if (game.turn !== myColor) game.undo();
    setHintArrow(null);
    rerender();
  };

  const showHint = () => {
    const m = engineHint(game.position.clone());
    if (m)
      setHintArrow({
        from: squareName(m.from),
        to: squareName(m.to),
        color: 'rgba(247,148,29,0.85)',
      });
  };

  const pos = game.position;
  const k = pos.kings[pos.side] ?? -1;
  const orientation: Color = flipped ? (myColor === 'w' ? 'b' : 'w') : myColor;
  const st = stats[String(level)] ?? { w: 0, d: 0, l: 0 };
  const lv = getLevel(level);

  return (
    <Screen title={t('play.title')} testID="screen-play">
      <View style={[styles.layout, isWide && { flexDirection: 'row', alignItems: 'flex-start' }]}>
        <View style={{ alignItems: 'center', gap: 8 }}>
          <Board
            testID="board"
            fen={game.fen}
            size={size}
            orientation={orientation}
            theme={boardTheme(settings.boardTheme)}
            showCoords={settings.coords}
            movable={busy || over ? null : myColor}
            targetsOf={(sq) => game.targets(sq)}
            onMove={onMove}
            lastMove={game.lastMove ? { from: game.lastMove.from, to: game.lastMove.to } : null}
            check={k !== -1 && pos.inCheck() ? squareName(k) : null}
            arrows={hintArrow ? [hintArrow] : []}
          />
          <Text style={styles.status}>
            {busy ? t('game.thinking') : game.turn === myColor ? t('game.yourTurn') : ''}
          </Text>
        </View>
        <View style={[styles.side, isWide && { width: 360 }]}>
          <Card style={{ gap: 10 }}>
            <Text style={styles.label}>{t('play.chooseLevel')}</Text>
            <View style={styles.levels}>
              {LEVELS.map((l, i) => (
                <Pressable
                  key={l.id}
                  testID={`level-${l.id}`}
                  accessibilityRole="button"
                  onPress={() => {
                    setLevel(l.id);
                    levelRef.current = l.id;
                    newGame();
                  }}
                  style={[styles.levelChip, level === l.id && styles.levelChipOn]}
                >
                  <Piece type={LEVEL_PIECES[i]!} color={level === l.id ? 'b' : 'w'} size={30} />
                  <Text style={[styles.levelText, level === l.id && { color: colors.primary }]}>
                    {L(l.name)}
                  </Text>
                </Pressable>
              ))}
            </View>
            <Text style={styles.desc}>{t(`play.levelDesc.${lv.id}`)}</Text>
            <Text style={styles.stats}>{t('play.stats', st)}</Text>
          </Card>
          <Card style={{ gap: 10 }}>
            <Text style={styles.label}>{t('play.chooseColor')}</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Button
                title={t('common.white')}
                tone={myColor === 'w' ? 'primary' : 'ghost'}
                size="sm"
                onPress={() => setMyColor('w')}
              />
              <Button
                title={t('common.black')}
                tone={myColor === 'b' ? 'primary' : 'ghost'}
                size="sm"
                onPress={() => setMyColor('b')}
              />
            </View>
          </Card>
          <View style={styles.row}>
            <Button
              title={t('play.newGame')}
              tone="accent"
              size="sm"
              onPress={() => newGame()}
              testID="new-game"
            />
            <Button title={t('common.hint')} tone="light" size="sm" onPress={showHint} />
            <Button title={t('common.undo')} tone="ghost" size="sm" onPress={undo} />
            <Button
              title={t('common.flip')}
              tone="ghost"
              size="sm"
              onPress={() => setFlipped((f) => !f)}
            />
          </View>
          <MoveList sans={game.history.map((h) => h.san)} />
        </View>
      </View>
      <ResultModal
        visible={!!over}
        title={over?.title ?? ''}
        text={over?.text}
        primary={{ title: t('play.newGame'), onPress: () => newGame() }}
        secondary={{ title: t('common.close'), onPress: () => setOver(null) }}
      />
      {promo && (
        <PromotionPicker
          color={myColor}
          onCancel={() => setPromo(null)}
          onPick={(p) => {
            const m = promo;
            setPromo(null);
            doMove(m.from, m.to, p);
          }}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  layout: { gap: space.md },
  side: { gap: space.sm, flexShrink: 1, width: '100%' },
  label: {
    fontFamily: fonts.bold,
    fontSize: 12,
    letterSpacing: 0.6,
    color: colors.muted,
    textTransform: 'uppercase',
  },
  levels: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  levelChip: {
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    minWidth: 76,
  },
  levelChipOn: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  levelText: { fontFamily: fonts.bold, fontSize: 12, color: colors.muted },
  desc: { fontFamily: fonts.regular, fontSize: 14, color: colors.text },
  stats: { fontFamily: fonts.medium, fontSize: 12, color: colors.muted },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  status: { fontFamily: fonts.medium, fontSize: 14, color: colors.blue, minHeight: 20 },
});
