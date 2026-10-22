import {
  type Color,
  Game,
  type PieceType,
  resultString,
  type Square,
  squareName,
} from '@duongsinh/chess-core';
import { type GameRow, getGame, playMove, resignGame, subscribeGame } from '@duongsinh/sync';
import { Board, Button, boardTheme, Card, colors, fonts, Piece, space } from '@duongsinh/ui';
import { useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { MoveList } from '@/components/MoveList';
import { PromotionPicker } from '@/components/PromotionPicker';
import { Screen } from '@/components/Screen';
import { useBoardSize, useIsWide } from '@/lib/hooks';
import { useLang } from '@/lib/i18n';
import { play } from '@/lib/sound';
import { useSettings } from '@/lib/store';
import { db, useAccount } from '@/lib/sync';

interface Player {
  nickname: string;
  avatar: string;
}

export default function OnlineGameScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useLang();
  const settings = useSettings();
  const me = useAccount((s) => s.profile);
  const size = useBoardSize();
  const isWide = useIsWide();
  const [row, setRow] = useState<GameRow | null>(null);
  const [game, setGame] = useState<Game | null>(null);
  const [players, setPlayers] = useState<Record<string, Player>>({});
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [promo, setPromo] = useState<{ from: Square; to: Square } | null>(null);
  const [, setTick] = useState(0);
  const gameRef = useRef<Game | null>(null);

  const load = useCallback(async () => {
    const c = db();
    if (!c || !id) return;
    try {
      const { game: g, moves } = await getGame(c, String(id));
      const local = new Game(g.initial_fen);
      for (const m of moves) local.move(m.uci);
      gameRef.current = local;
      setGame(local);
      setRow(g);
      const { data } = await c
        .from('profiles')
        .select('id, nickname, avatar')
        .in('id', [g.white_id, g.black_id]);
      const map: Record<string, Player> = {};
      for (const p of data ?? []) map[p.id] = { nickname: p.nickname, avatar: p.avatar };
      setPlayers(map);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const c = db();
    if (!c || !id) return;
    return subscribeGame(c, String(id), {
      onMove: (m) => {
        const g = gameRef.current;
        if (!g) return;
        if (m.ply === g.history.length + 1) {
          const e = g.move(m.uci);
          if (e) play(e.captured ? 'capture' : e.san.includes('+') ? 'check' : 'move');
          setTick((x) => x + 1);
        } else if (m.ply > g.history.length + 1) void load();
      },
      onGame: (r) => setRow(r),
    });
  }, [id, load]);

  if (!row || !game) {
    return (
      <Screen back title="…">
        {error ? (
          <Text style={styles.error}>{error}</Text>
        ) : (
          <ActivityIndicator color={colors.primary} />
        )}
      </Screen>
    );
  }

  const myColor: Color | null =
    me?.id === row.white_id ? 'w' : me?.id === row.black_id ? 'b' : null;
  const myTurn = row.status === 'active' && myColor === game.turn && !sending;
  const pos = game.position;
  const k = pos.kings[pos.side] ?? -1;
  const white = players[row.white_id];
  const black = players[row.black_id];

  const send = async (from: Square, to: Square, promotion?: PieceType) => {
    const c = db();
    if (!c) return;
    const e = game.move({ from, to, promotion });
    if (!e) {
      play('wrong');
      return;
    }
    play(e.captured ? 'capture' : e.san.includes('+') ? 'check' : 'move');
    setTick((x) => x + 1);
    const outcome = game.outcome();
    setSending(true);
    try {
      const updated = await playMove(c, {
        gameId: row.id,
        ply: game.history.length,
        uci: e.uci,
        san: e.san,
        fenAfter: e.fenAfter,
        result: outcome ? resultString(outcome) : null,
      });
      setRow(updated);
      if (outcome) play('win');
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      await load();
    } finally {
      setSending(false);
    }
  };

  const playerLine = (p: Player | undefined, color: Color) => (
    <View style={styles.player}>
      <Piece type={(p?.avatar ?? 'p') as 'p'} color={color} size={30} />
      <Text
        style={[
          styles.playerName,
          game.turn === color && row.status === 'active' && { color: colors.orange },
        ]}
      >
        {p?.nickname ?? '?'}
      </Text>
    </View>
  );

  const orientation: Color = myColor ?? 'w';
  return (
    <Screen
      back
      title={t('online.vs', { white: white?.nickname ?? '?', black: black?.nickname ?? '?' })}
      testID="screen-online"
    >
      <View style={[styles.layout, isWide && { flexDirection: 'row', alignItems: 'flex-start' }]}>
        <View style={{ gap: 8, alignItems: 'center' }}>
          {playerLine(orientation === 'w' ? black : white, orientation === 'w' ? 'b' : 'w')}
          <Board
            fen={game.fen}
            size={size}
            orientation={orientation}
            theme={boardTheme(settings.boardTheme)}
            showCoords={settings.coords}
            movable={myTurn ? myColor : null}
            targetsOf={(sq) => game.targets(sq)}
            onMove={(from, to) => {
              if (game.isPromotion(from, to)) setPromo({ from, to });
              else void send(from, to);
            }}
            lastMove={game.lastMove ? { from: game.lastMove.from, to: game.lastMove.to } : null}
            check={k !== -1 && pos.inCheck() ? squareName(k) : null}
          />
          {playerLine(orientation === 'w' ? white : black, orientation)}
        </View>
        <View style={[styles.side, isWide && { width: 340 }]}>
          <Card style={{ gap: 8 }}>
            <Text style={styles.status}>
              {row.status === 'waiting'
                ? t('club.waiting')
                : row.status === 'active'
                  ? myTurn
                    ? t('game.yourTurn')
                    : t('online.opponentTurn')
                  : t('online.result', { result: row.result ?? '—' })}
            </Text>
          </Card>
          <MoveList sans={game.history.map((h) => h.san)} />
          {row.status === 'active' && myColor && (
            <Button
              title={t('play.resign')}
              tone="ghost"
              size="sm"
              onPress={() => {
                const c = db();
                if (c)
                  void resignGame(c, row.id)
                    .then(setRow)
                    .catch((e: Error) => setError(e.message));
              }}
            />
          )}
          {error && <Text style={styles.error}>{error}</Text>}
        </View>
      </View>
      {promo && myColor && (
        <PromotionPicker
          color={myColor}
          onCancel={() => setPromo(null)}
          onPick={(p) => {
            const m = promo;
            setPromo(null);
            void send(m.from, m.to, p);
          }}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  layout: { gap: space.md },
  side: { gap: space.sm, flexShrink: 1, width: '100%' },
  player: { flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'stretch' },
  playerName: { fontFamily: fonts.bold, fontSize: 16, color: colors.text },
  status: { fontFamily: fonts.bold, fontSize: 18, color: colors.primary },
  error: { fontFamily: fonts.medium, fontSize: 14, color: colors.red },
});
