import { type PieceType, type Square, squareName } from '@duongsinh/chess-core';
import type { MiniGame, SessionEvent } from '@duongsinh/minigames';
import { MiniGameSession } from '@duongsinh/minigames';
import {
  type Arrow,
  Board,
  Button,
  boardTheme,
  Card,
  colors,
  fonts,
  Pill,
  type SquareMark,
  Stars,
  space,
} from '@duongsinh/ui';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useBoardSize, useIsWide } from '@/lib/hooks';
import { useLang } from '@/lib/i18n';
import { play } from '@/lib/sound';
import { useProgress, useSettings } from '@/lib/store';
import { PromotionPicker } from './PromotionPicker';
import { ResultModal } from './ResultModal';

export interface MiniGamePlayerProps {
  def: MiniGame;
  /** Khóa lưu tiến độ (mặc định = def.id). */
  itemId?: string;
  onNext?: () => void;
  onExit?: () => void;
  /** Chế độ lớp học: bàn lớn, phím tắt, vẽ chú thích. */
  classroom?: boolean;
  /** Ẩn phần câu chuyện mở đầu. */
  skipIntro?: boolean;
}

type Banner = { text: string; tone: 'info' | 'good' | 'bad' } | null;

export function MiniGamePlayer({
  def,
  itemId,
  onNext,
  onExit,
  classroom = false,
  skipIntro,
}: MiniGamePlayerProps) {
  const { t, L } = useLang();
  const settings = useSettings();
  const record = useProgress((s) => s.record);
  const session = useMemo(() => new MiniGameSession(def, { seed: Date.now() }), [def]);
  const [, setTick] = useState(0);
  const rerender = useCallback(() => setTick((x) => x + 1), []);
  const [busy, setBusy] = useState(false);
  const [banner, setBanner] = useState<Banner>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [promo, setPromo] = useState<{ from: Square; to: Square } | null>(null);
  const [intro, setIntro] = useState(!skipIntro && !classroom);
  const [result, setResult] = useState<{ stars: number } | null>(null);
  const [drawArrows, setDrawArrows] = useState<Arrow[]>([]);
  const [drawMarks, setDrawMarks] = useState<SquareMark[]>([]);
  const [annotate, setAnnotate] = useState(false);
  const recorded = useRef(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const isWide = useIsWide();
  const size = useBoardSize({ max: classroom ? 900 : 560, reserve: classroom ? 120 : undefined });

  useEffect(
    () => () => {
      for (const id of timers.current) clearTimeout(id);
    },
    [],
  );
  const later = useCallback((fn: () => void, ms: number) => {
    timers.current.push(setTimeout(fn, ms));
  }, []);

  const handle = useCallback(
    (events: SessionEvent[]) => {
      for (const e of events) {
        switch (e.type) {
          case 'move':
            play(
              e.san.includes('x')
                ? 'capture'
                : e.san.includes('+') || e.san.includes('#')
                  ? 'check'
                  : 'move',
            );
            break;
          case 'collect':
            play('star');
            break;
          case 'mistake':
            play('wrong');
            setBanner({ text: L(e.message), tone: 'bad' });
            break;
          case 'illegal':
            play('wrong');
            break;
          case 'correct':
            setBanner(null);
            break;
          case 'trap':
          case 'captured':
            play('wrong');
            break;
          case 'round-won':
            play('star');
            setBanner({ text: t('game.roundWon'), tone: 'good' });
            break;
          case 'won':
            play('win');
            if (!recorded.current) {
              recorded.current = true;
              record(itemId ?? def.id, e.stars, session.totalMoves);
            }
            setResult({ stars: e.stars });
            break;
          case 'lost':
            setBanner({ text: L(e.reason), tone: 'bad' });
            if (!recorded.current) record(itemId ?? def.id, 0, null);
            break;
        }
      }
      setHint(null);
      rerender();
    },
    [L, t, def.id, itemId, record, rerender, session],
  );

  /** Sau nước của người chơi: máy trả lời (hoặc lời giải bài tập tự đi). */
  const reply = useCallback(() => {
    if (session.status !== 'playing') return;
    if (session.round.mode === 'puzzle' && session.game.turn !== session.playerColor) {
      setBusy(true);
      later(() => {
        handle(session.puzzleReply());
        setBusy(false);
      }, 550);
      return;
    }
    if (session.needsEngineMove) {
      setBusy(true);
      later(() => {
        handle(session.engineMove());
        setBusy(false);
        // Thế hiếm: máy vẫn còn lượt (ví dụ người chơi không còn nước) — để bộ chấm xử lý.
      }, 380);
    }
  }, [handle, later, session]);

  const doMove = useCallback(
    (from: Square, to: Square, promotion?: PieceType) => {
      const events = session.playerMove(from, to, promotion);
      handle(events);
      if (!events.some((e) => e.type === 'illegal' || e.type === 'mistake')) reply();
    },
    [handle, reply, session],
  );

  const onMove = useCallback(
    (from: Square, to: Square) => {
      if (busy) return;
      if (session.round.mode !== 'collect' && session.game.isPromotion(from, to)) {
        setPromo({ from, to });
        return;
      }
      doMove(from, to);
    },
    [busy, doMove, session],
  );

  const onSquarePress = useCallback(
    (sq: Square) => {
      if (session.round.mode !== 'quiz' || busy) return;
      const events = session.tapSquare(sq);
      if (events.some((e) => e.type === 'correct')) play('star');
      handle(events);
    },
    [busy, handle, session],
  );

  const showHint = useCallback(() => {
    const h = session.hint();
    setHint(h);
    rerender();
    return h;
  }, [rerender, session]);

  /** Lớp học: tự đi một bước của lời giải/gợi ý. */
  const stepForward = useCallback(() => {
    if (session.status === 'round-won') {
      handle(session.nextRound());
      return;
    }
    if (session.status !== 'playing' || busy) return;
    const h = session.hint();
    if (!h) return;
    if (h.length === 2) {
      onSquarePress(h as Square);
      return;
    }
    doMove(
      h.slice(0, 2) as Square,
      h.slice(2, 4) as Square,
      (h[4] as PieceType | undefined) ?? undefined,
    );
  }, [busy, doMove, handle, onSquarePress, session]);

  const restart = useCallback(() => {
    session.restartRound();
    recorded.current = false;
    setBanner(null);
    setHint(null);
    setDrawArrows([]);
    setDrawMarks([]);
    rerender();
  }, [rerender, session]);

  // Phím tắt cho chế độ lớp học (web/desktop).
  useEffect(() => {
    if (!classroom || Platform.OS !== 'web' || typeof window === 'undefined') return;
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === 'ArrowRight') stepForward();
      else if (ev.key === 'ArrowLeft') {
        session.undo();
        rerender();
      } else if (ev.key === 'r' || ev.key === 'R') restart();
      else if (ev.key === 'd' || ev.key === 'D') setAnnotate((a) => !a);
      else if (ev.key === 'f' || ev.key === 'F') {
        const doc = window.document;
        if (doc.fullscreenElement) void doc.exitFullscreen();
        else void doc.documentElement.requestFullscreen?.();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [classroom, rerender, restart, session, stepForward]);

  // ------------------------------------------------------------- hiển thị
  const round = session.round;
  const quiz = session.quizState();
  const pos = session.position;
  const kingIdx = pos.kings[pos.side] ?? -1;
  const check =
    round.mode !== 'quiz' && kingIdx !== -1 && pos.inCheck() ? squareName(kingIdx) : null;
  const theme = boardTheme(settings.boardTheme);

  const marks: SquareMark[] = [...drawMarks];
  if (quiz?.question.kind !== 'find-square' && quiz?.question.highlight) {
    for (const sq of quiz.question.highlight)
      marks.push({ square: sq, color: 'rgba(34,117,180,0.35)' });
  }
  if (quiz)
    for (const sq of quiz.selected) marks.push({ square: sq, color: 'rgba(45,164,74,0.55)' });
  const remaining = session.remainingTargets();
  if (round.mode === 'collect' && round.ordered && remaining[0]) {
    marks.push({ square: remaining[0], color: 'rgba(251,176,64,0.45)' });
  }
  const arrows: Arrow[] = [...drawArrows];
  if (hint && hint.length >= 4) {
    arrows.push({
      from: hint.slice(0, 2) as Square,
      to: hint.slice(2, 4) as Square,
      color: 'rgba(247,148,29,0.85)',
    });
  } else if (hint && hint.length === 2) {
    marks.push({ square: hint as Square, color: 'rgba(247,148,29,0.55)' });
  }

  let prompt = L(def.goal);
  if (quiz) {
    const q = quiz.question;
    if (q.kind === 'find-square') prompt = t('game.findSquare', { square: quiz.target });
    else if (q.kind === 'squares')
      prompt = `${L(q.prompt)} (${quiz.selected.length}/${q.answer.length})`;
    else prompt = L(q.prompt);
  } else if (round.mode === 'puzzle' && round.prompt) prompt = L(round.prompt);

  const movesLeft = session.movesLeft();
  const status = busy
    ? t('game.thinking')
    : session.status === 'playing' && round.mode !== 'quiz'
      ? session.isPlayerTurn
        ? t('game.yourTurn')
        : ''
      : '';

  const board = (
    <Board
      testID="board"
      fen={pos.toFen()}
      size={size}
      orientation={session.playerColor}
      theme={theme}
      showCoords={settings.coords}
      movable={
        annotate || round.mode === 'quiz' || busy || session.status !== 'playing'
          ? null
          : session.playerColor
      }
      targetsOf={(sq) => session.game.targets(sq)}
      onMove={onMove}
      onSquarePress={onSquarePress}
      lastMove={session.lastMove()}
      check={check}
      stars={remaining}
      traps={session.trapSquares()}
      marks={marks}
      arrows={arrows}
      annotate={annotate}
      onArrowsChange={setDrawArrows}
      onMarksChange={setDrawMarks}
    />
  );

  const side = (
    <View style={[styles.side, isWide && { width: 340 }]}>
      <View style={styles.rowWrap}>
        {def.rounds.length > 1 && (
          <Pill
            text={t('game.round', { current: session.roundIndex + 1, total: def.rounds.length })}
          />
        )}
        {quiz && (
          <Pill
            text={t('game.question', { current: quiz.index + 1, total: quiz.total })}
            bg={colors.goldLight}
            color={colors.orange}
          />
        )}
        {movesLeft !== null && (
          <Pill
            text={t('game.movesLeft', { count: Math.max(0, movesLeft) })}
            bg="#E9F7F1"
            color={colors.green}
          />
        )}
        {round.mode === 'collect' && (
          <Pill
            text={t('game.starsCollected', { count: remaining.length })}
            bg={colors.goldLight}
            color={colors.orange}
          />
        )}
      </View>
      <Card style={{ gap: 6 }}>
        <Text style={styles.label}>{t('game.goal')}</Text>
        <Text style={styles.prompt} testID="prompt">
          {prompt}
        </Text>
        {status ? <Text style={styles.status}>{status}</Text> : null}
      </Card>
      {quiz?.question.kind === 'choice' && (
        <View style={styles.choices}>
          {quiz.question.options.map((o, i) => (
            <Button
              key={i}
              title={L(o)}
              tone="light"
              size="lg"
              testID={`choice-${i}`}
              onPress={() => {
                const ev = session.answerChoice(i);
                if (ev.some((e) => e.type === 'correct')) play('star');
                handle(ev);
              }}
            />
          ))}
        </View>
      )}
      {banner && (
        <View
          style={[
            styles.banner,
            banner.tone === 'bad' && { backgroundColor: '#FDECEC', borderColor: '#F5B5B7' },
            banner.tone === 'good' && { backgroundColor: '#E9F7F1', borderColor: '#A8E0C4' },
          ]}
          testID="banner"
        >
          <Text style={styles.bannerText}>{banner.text}</Text>
        </View>
      )}
      <View style={styles.rowWrap}>
        {session.status === 'round-won' && (
          <Button
            title={t('common.next')}
            tone="accent"
            testID="next-round"
            onPress={() => {
              setBanner(null);
              handle(session.nextRound());
            }}
          />
        )}
        {session.status === 'lost' && (
          <Button title={t('common.retry')} tone="accent" onPress={restart} testID="retry" />
        )}
        {session.status === 'playing' && (
          <Button
            title={t('common.hint')}
            tone="light"
            size="sm"
            onPress={showHint}
            testID="hint"
          />
        )}
        {session.status === 'playing' && round.mode !== 'quiz' && round.mode !== 'puzzle' && (
          <Button
            title={t('common.undo')}
            tone="ghost"
            size="sm"
            onPress={() => {
              session.undo();
              setBanner(null);
              rerender();
            }}
          />
        )}
        {classroom && (
          <>
            <Button title={t('classroom.demo')} tone="primary" size="sm" onPress={stepForward} />
            <Button
              title={annotate ? '✏️ ON' : '✏️'}
              tone={annotate ? 'accent' : 'ghost'}
              size="sm"
              onPress={() => setAnnotate((a) => !a)}
            />
            <Button title="↺" tone="ghost" size="sm" onPress={restart} />
          </>
        )}
      </View>
      {classroom && Platform.OS === 'web' && (
        <Text style={styles.small}>{t('classroom.keys')}</Text>
      )}
      {!classroom && (
        <Pressable onPress={() => setIntro(true)}>
          <Text style={styles.link}>📖 {t('game.story')}</Text>
        </Pressable>
      )}
    </View>
  );

  return (
    <View style={{ gap: space.md }}>
      <View style={[styles.layout, isWide && { flexDirection: 'row', alignItems: 'flex-start' }]}>
        <View style={{ alignItems: 'center' }}>{board}</View>
        {side}
      </View>

      <ResultModal
        visible={intro}
        title={L(def.title)}
        text={`${L(def.story)}\n\n🎯 ${L(def.goal)}`}
        primary={{ title: t('common.start'), onPress: () => setIntro(false) }}
      />
      <ResultModal
        visible={!!result}
        title={t('game.won')}
        stars={result?.stars}
        text={`${t('game.wonText')}\n\n💡 ${L(def.lesson)}`}
        primary={
          onNext
            ? {
                title: t('game.nextGame'),
                onPress: () => {
                  setResult(null);
                  onNext();
                },
              }
            : {
                title: t('common.retry'),
                onPress: () => {
                  setResult(null);
                  recorded.current = false;
                  session.startRound(0);
                  rerender();
                },
              }
        }
        secondary={
          onExit
            ? {
                title: t('game.backToPath'),
                onPress: () => {
                  setResult(null);
                  onExit();
                },
              }
            : undefined
        }
      />
      {promo && (
        <PromotionPicker
          color={session.playerColor}
          onCancel={() => setPromo(null)}
          onPick={(p) => {
            const m = promo;
            setPromo(null);
            doMove(m.from, m.to, p);
          }}
        />
      )}
    </View>
  );
}

/** Hiển thị nhanh số sao đã đạt. */
export function StarBadge({ value }: { value: number }) {
  return <Stars value={value} size={14} />;
}

const styles = StyleSheet.create({
  layout: { gap: space.md, flexDirection: 'column' },
  side: { gap: space.sm, flexShrink: 1, width: '100%' },
  rowWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, alignItems: 'center' },
  label: {
    fontFamily: fonts.bold,
    fontSize: 12,
    letterSpacing: 0.6,
    color: colors.muted,
    textTransform: 'uppercase',
  },
  prompt: { fontFamily: fonts.bold, fontSize: 18, color: colors.text, lineHeight: 25 },
  status: { fontFamily: fonts.medium, fontSize: 14, color: colors.blue },
  choices: { gap: space.sm },
  banner: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: colors.primaryLight,
    borderColor: colors.border,
  },
  bannerText: { fontFamily: fonts.medium, fontSize: 15, color: colors.text },
  link: { fontFamily: fonts.medium, fontSize: 14, color: colors.blue, marginTop: 4 },
  small: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted },
});
