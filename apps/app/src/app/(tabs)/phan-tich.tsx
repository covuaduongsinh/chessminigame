import {
  type Color,
  findUci,
  type PieceType,
  Position,
  parsePgn,
  type Square,
  START_FEN,
  squareName,
  toPgn,
  toSan,
} from '@duongsinh/chess-core';
import { CLASSICS, illegalMessage } from '@duongsinh/minigames';
import {
  type Arrow,
  Board,
  Button,
  boardTheme,
  Card,
  colors,
  fonts,
  Piece,
  type SquareMark,
  space,
} from '@duongsinh/ui';
import * as Clipboard from 'expo-clipboard';
import * as DocumentPicker from 'expo-document-picker';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { MoveList } from '@/components/MoveList';
import { PromotionPicker } from '@/components/PromotionPicker';
import { Screen, Section } from '@/components/Screen';
import { useBoardSize, useIsWide } from '@/lib/hooks';
import { useLang } from '@/lib/i18n';
import { play } from '@/lib/sound';
import { useSettings } from '@/lib/store';

interface Entry {
  san: string;
  uci: string;
  fen: string;
  comment?: string;
}

const EMPTY = '8/8/8/8/8/8/8/8 w - - 0 1';
const PALETTE: Array<{ color: Color; type: PieceType }> = (['w', 'b'] as const).flatMap((color) =>
  (['k', 'q', 'r', 'b', 'n', 'p'] as const).map((type) => ({ color, type })),
);

export default function AnalysisScreen() {
  const { t, L } = useLang();
  const settings = useSettings();
  const size = useBoardSize();
  const isWide = useIsWide();
  const [startFen, setStartFen] = useState(START_FEN);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [cursor, setCursor] = useState(0);
  const [mode, setMode] = useState<'play' | 'edit'>('play');
  const [editFen, setEditFen] = useState(START_FEN);
  const [brush, setBrush] = useState<{ color: Color; type: PieceType } | 'eraser'>({
    color: 'w',
    type: 'q',
  });
  const [annotate, setAnnotate] = useState(false);
  const [arrows, setArrows] = useState<Arrow[]>([]);
  const [marks, setMarks] = useState<SquareMark[]>([]);
  const [orientation, setOrientation] = useState<Color>('w');
  const [pgnText, setPgnText] = useState('');
  const [lichessId, setLichessId] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [promo, setPromo] = useState<{ from: Square; to: Square } | null>(null);
  const [tags, setTags] = useState<Record<string, string>>({});

  const fen = cursor === 0 ? startFen : entries[cursor - 1]!.fen;
  const position = useMemo(() => Position.fromFen(fen), [fen]);

  // ← → để xem lại ván trên web/desktop
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    const onKey = (e: KeyboardEvent) => {
      if (
        (e.target as HTMLElement | null)?.tagName === 'TEXTAREA' ||
        (e.target as HTMLElement | null)?.tagName === 'INPUT'
      )
        return;
      if (e.key === 'ArrowLeft') setCursor((c) => Math.max(0, c - 1));
      if (e.key === 'ArrowRight') setCursor((c) => Math.min(entries.length, c + 1));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [entries.length]);

  const applyMove = (from: Square, to: Square, promotion?: PieceType) => {
    const pos = Position.fromFen(fen);
    const m = findUci(pos, `${from}${to}${promotion ?? ''}`);
    if (!m) {
      play('wrong');
      const why = illegalMessage(pos, from, to);
      if (why) setMessage(`⚠ ${L(why)}`);
      return;
    }
    const san = toSan(pos, m);
    pos.make(m);
    play(m.captured ? 'capture' : san.includes('+') ? 'check' : 'move');
    const next = [
      ...entries.slice(0, cursor),
      { san, uci: `${from}${to}${promotion ?? ''}`, fen: pos.toFen() },
    ];
    setEntries(next);
    setCursor(next.length);
    setArrows([]);
    setMarks([]);
  };

  const onMove = (from: Square, to: Square) => {
    const pos = Position.fromFen(fen);
    const isPromo = pos
      .legalMoves()
      .some((m) => squareName(m.from) === from && squareName(m.to) === to && m.promotion);
    if (isPromo) setPromo({ from, to });
    else applyMove(from, to);
  };

  const loadPgn = (text: string) => {
    try {
      const g = parsePgn(text);
      setStartFen(g.startFen);
      setEntries(
        g.moves.map((m) => ({ san: m.san, uci: m.uci, fen: m.fenAfter, comment: m.comment })),
      );
      setCursor(0);
      setTags(g.tags);
      setMode('play');
      setMessage(`✓ ${g.tags.White ?? '?'} – ${g.tags.Black ?? '?'} (${g.moves.length} ply)`);
    } catch (e) {
      setMessage(`⚠ ${e instanceof Error ? e.message : String(e)}`);
    }
  };

  const pickFile = async () => {
    const res = await DocumentPicker.getDocumentAsync({ type: '*/*', copyToCacheDirectory: true });
    if (res.canceled || !res.assets[0]) return;
    const text = await (await fetch(res.assets[0].uri)).text();
    setPgnText(text);
    loadPgn(text);
  };

  const fetchLichess = async () => {
    const id = lichessId
      .trim()
      .replace(/^https?:\/\/lichess\.org\//, '')
      .slice(0, 8);
    if (!/^[a-zA-Z0-9]{8}$/.test(id)) {
      setMessage('⚠ Mã ván Lichess gồm 8 ký tự');
      return;
    }
    try {
      const res = await fetch(`https://lichess.org/game/export/${id}?clocks=false&evals=false`, {
        headers: { Accept: 'application/x-chess-pgn' },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      setPgnText(text);
      loadPgn(text);
    } catch (e) {
      setMessage(`⚠ ${e instanceof Error ? e.message : String(e)}`);
    }
  };

  const onEditSquare = (sq: Square) => {
    const pos = Position.fromFen(editFen);
    if (brush === 'eraser') pos.put(sq, null);
    else {
      const cur = pos.get(sq);
      pos.put(sq, cur && cur.color === brush.color && cur.type === brush.type ? null : brush);
    }
    setEditFen(pos.toFen());
  };

  const finishEdit = () => {
    const pos = Position.fromFen(editFen);
    // Tự cho quyền nhập thành nếu Vua/Xe ở ô gốc.
    const parts = editFen.split(' ');
    const castle =
      `${pos.get('e1')?.type === 'k' && pos.get('h1')?.type === 'r' ? 'K' : ''}${pos.get('e1')?.type === 'k' && pos.get('a1')?.type === 'r' ? 'Q' : ''}` +
      `${pos.get('e8')?.type === 'k' && pos.get('h8')?.type === 'r' ? 'k' : ''}${pos.get('e8')?.type === 'k' && pos.get('a8')?.type === 'r' ? 'q' : ''}`;
    const fenOut = `${parts[0]} ${parts[1]} ${castle || '-'} - 0 1`;
    const errors = Position.fromFen(fenOut).validateStandard();
    if (errors.length) {
      setMessage(`⚠ ${t('analysis.invalid')}: ${errors.join('; ')}`);
      return;
    }
    setStartFen(fenOut);
    setEntries([]);
    setCursor(0);
    setTags({});
    setMode('play');
    setMessage(null);
  };

  const pgnOut = () =>
    toPgn({
      tags: { ...tags, Site: 'Dương Sinh Chess' },
      startFen,
      sans: entries.map((e) => e.san),
      result: tags.Result,
    });

  const k = position.kings[position.side] ?? -1;
  const comment = cursor > 0 ? entries[cursor - 1]?.comment : undefined;
  const turnColor = editFen.split(' ')[1] === 'b' ? 'b' : 'w';

  return (
    <Screen title={t('analysis.title')} testID="screen-analysis">
      <View style={[styles.layout, isWide && { flexDirection: 'row', alignItems: 'flex-start' }]}>
        <View style={{ alignItems: 'center', gap: 8 }}>
          {mode === 'edit' ? (
            <Board
              testID="board"
              fen={editFen}
              size={size}
              orientation={orientation}
              theme={boardTheme(settings.boardTheme)}
              showCoords={settings.coords}
              onSquarePress={onEditSquare}
            />
          ) : (
            <Board
              testID="board"
              fen={fen}
              size={size}
              orientation={orientation}
              theme={boardTheme(settings.boardTheme)}
              showCoords={settings.coords}
              movable={annotate ? null : 'both'}
              targetsOf={(sq) => [...new Set(position.movesFrom(sq).map((m) => squareName(m.to)))]}
              onMove={onMove}
              lastMove={
                cursor > 0
                  ? {
                      from: entries[cursor - 1]!.uci.slice(0, 2) as Square,
                      to: entries[cursor - 1]!.uci.slice(2, 4) as Square,
                    }
                  : null
              }
              check={k !== -1 && position.inCheck() ? squareName(k) : null}
              annotate={annotate}
              arrows={arrows}
              marks={marks}
              onArrowsChange={setArrows}
              onMarksChange={setMarks}
            />
          )}
          {mode === 'play' && (
            <View style={styles.nav}>
              <Button title="⏮" tone="ghost" size="sm" onPress={() => setCursor(0)} />
              <Button
                title="◀"
                tone="ghost"
                size="sm"
                onPress={() => setCursor((c) => Math.max(0, c - 1))}
                testID="prev"
              />
              <Text style={styles.navText}>
                {cursor}/{entries.length}
              </Text>
              <Button
                title="▶"
                tone="ghost"
                size="sm"
                onPress={() => setCursor((c) => Math.min(entries.length, c + 1))}
                testID="nextply"
              />
              <Button title="⏭" tone="ghost" size="sm" onPress={() => setCursor(entries.length)} />
            </View>
          )}
        </View>

        <View style={[styles.side, isWide && { width: 380 }]}>
          <View style={styles.row}>
            <Button
              title={mode === 'edit' ? `✓ ${t('common.save')}` : t('analysis.editor')}
              tone={mode === 'edit' ? 'success' : 'light'}
              size="sm"
              testID="toggle-editor"
              onPress={() => {
                if (mode === 'edit') finishEdit();
                else {
                  setEditFen(fen);
                  setMode('edit');
                }
              }}
            />
            {mode === 'play' && (
              <Button
                title={annotate ? `✏️ ${t('analysis.draw')}` : t('analysis.draw')}
                tone={annotate ? 'accent' : 'ghost'}
                size="sm"
                onPress={() => setAnnotate((a) => !a)}
              />
            )}
            {(arrows.length > 0 || marks.length > 0) && (
              <Button
                title={t('analysis.clearDrawing')}
                tone="ghost"
                size="sm"
                onPress={() => {
                  setArrows([]);
                  setMarks([]);
                }}
              />
            )}
            <Button
              title={t('common.flip')}
              tone="ghost"
              size="sm"
              onPress={() => setOrientation((o) => (o === 'w' ? 'b' : 'w'))}
            />
          </View>

          {mode === 'edit' && (
            <Card style={{ gap: 10 }}>
              <View style={styles.palette}>
                {PALETTE.map((p) => {
                  const on = brush !== 'eraser' && brush.color === p.color && brush.type === p.type;
                  return (
                    <Pressable
                      key={`${p.color}${p.type}`}
                      onPress={() => setBrush(p)}
                      style={[styles.paletteItem, on && styles.paletteOn]}
                      testID={`brush-${p.color}${p.type}`}
                    >
                      <Piece type={p.type} color={p.color} size={36} />
                    </Pressable>
                  );
                })}
                <Pressable
                  onPress={() => setBrush('eraser')}
                  style={[styles.paletteItem, brush === 'eraser' && styles.paletteOn]}
                >
                  <Text style={{ fontSize: 24 }}>🧽</Text>
                </Pressable>
              </View>
              <View style={styles.row}>
                <Button
                  title={t('analysis.start')}
                  tone="ghost"
                  size="sm"
                  onPress={() => setEditFen(START_FEN)}
                />
                <Button
                  title={t('analysis.empty')}
                  tone="ghost"
                  size="sm"
                  onPress={() => setEditFen(EMPTY)}
                />
                <Button
                  title={`${t('analysis.turn')}: ${turnColor === 'w' ? t('common.white') : t('common.black')}`}
                  tone="ghost"
                  size="sm"
                  onPress={() => {
                    const parts = editFen.split(' ');
                    parts[1] = turnColor === 'w' ? 'b' : 'w';
                    setEditFen(parts.join(' '));
                  }}
                />
              </View>
            </Card>
          )}

          {comment ? (
            <Card style={{ backgroundColor: colors.goldLight, borderColor: colors.gold }}>
              <Text style={styles.comment}>💬 {comment}</Text>
            </Card>
          ) : null}

          {mode === 'play' && (
            <MoveList
              sans={entries.map((e) => e.san)}
              current={cursor}
              onSelect={setCursor}
              startPly={Position.fromFen(startFen).side}
            />
          )}

          <View style={styles.row}>
            <Button
              title={t('analysis.copyFen')}
              tone="ghost"
              size="sm"
              onPress={() =>
                void Clipboard.setStringAsync(mode === 'edit' ? editFen : fen).then(() =>
                  setMessage(t('common.copied')),
                )
              }
            />
            <Button
              title={t('analysis.copyPgn')}
              tone="ghost"
              size="sm"
              onPress={() =>
                void Clipboard.setStringAsync(pgnOut()).then(() => setMessage(t('common.copied')))
              }
            />
          </View>

          <Card style={{ gap: 8 }}>
            <Text style={styles.label}>{t('analysis.importPgn')}</Text>
            <TextInput
              testID="pgn-input"
              value={pgnText}
              onChangeText={setPgnText}
              placeholder={t('analysis.pastePgn')}
              multiline
              style={styles.input}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <View style={styles.row}>
              <Button
                title={t('analysis.load')}
                size="sm"
                onPress={() => loadPgn(pgnText)}
                testID="load-pgn"
              />
              <Button
                title={t('analysis.file')}
                tone="ghost"
                size="sm"
                onPress={() => void pickFile()}
              />
            </View>
            <Text style={styles.small}>{t('analysis.fromLichess')}</Text>
            <View style={styles.row}>
              <TextInput
                value={lichessId}
                onChangeText={setLichessId}
                placeholder={t('analysis.lichessId')}
                style={[styles.input, { minHeight: 40, flex: 1 }]}
                autoCapitalize="none"
              />
              <Button title="↓" tone="ghost" size="sm" onPress={() => void fetchLichess()} />
            </View>
          </Card>
          {message ? (
            <Text style={styles.message} testID="analysis-message">
              {message}
            </Text>
          ) : null}
        </View>
      </View>

      <Section title={t('analysis.classics')}>
        <View style={styles.classics}>
          {CLASSICS.map((c) => (
            <Pressable
              key={c.id}
              onPress={() => router.push(`/ky-dien/${c.id}`)}
              testID={`classic-${c.id}`}
            >
              <Card style={styles.classicCard}>
                <Text style={styles.classicTitle}>{L(c.title)}</Text>
                <Text style={styles.small}>
                  {c.white} – {c.black}
                  {c.year ? ` · ${c.event} ${c.year}` : ''}
                </Text>
              </Card>
            </Pressable>
          ))}
        </View>
      </Section>
      {promo && (
        <PromotionPicker
          color={position.turn}
          onCancel={() => setPromo(null)}
          onPick={(p) => {
            const m = promo;
            setPromo(null);
            applyMove(m.from, m.to, p);
          }}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  layout: { gap: space.md },
  side: { gap: space.sm, flexShrink: 1, width: '100%' },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center' },
  nav: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  navText: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.text,
    minWidth: 54,
    textAlign: 'center',
  },
  label: {
    fontFamily: fonts.bold,
    fontSize: 12,
    letterSpacing: 0.6,
    color: colors.muted,
    textTransform: 'uppercase',
  },
  input: {
    minHeight: 90,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 10,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.text,
    backgroundColor: colors.bg,
    textAlignVertical: 'top',
  },
  palette: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  paletteItem: {
    width: 46,
    height: 46,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paletteOn: { borderColor: colors.orange, backgroundColor: colors.goldLight },
  comment: { fontFamily: fonts.medium, fontSize: 15, color: colors.text, lineHeight: 21 },
  small: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted },
  message: { fontFamily: fonts.medium, fontSize: 14, color: colors.primary },
  classics: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  classicCard: { minWidth: 220, gap: 4 },
  classicTitle: { fontFamily: fonts.bold, fontSize: 15, color: colors.primary },
});
