import {
  type Color,
  isSquare,
  type Piece as PieceT,
  Position,
  type Square,
} from '@duongsinh/chess-core';
import { memo, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  type GestureResponderEvent,
  PanResponder,
  type PanResponderGestureState,
  StyleSheet,
  View,
} from 'react-native';
import Svg, { Circle, G, Line, Polygon, Rect, Text as SvgText } from 'react-native-svg';
import { Piece } from './Piece';
import { BOARD_THEMES, type BoardTheme, colors, fonts } from './theme';

export interface Arrow {
  from: Square;
  to: Square;
  color?: string;
}

export interface SquareMark {
  square: Square;
  color: string;
}

export interface BoardProps {
  fen: string;
  size: number;
  orientation?: Color;
  theme?: BoardTheme;
  showCoords?: boolean;
  /** Màu quân người chơi được phép đi ('both' cho bàn phân tích, null để khóa). */
  movable?: Color | 'both' | null;
  /** Các ô có thể đi tới từ một ô (để vẽ chấm gợi ý). */
  targetsOf?: (from: Square) => Square[];
  onMove?: (from: Square, to: Square) => void;
  /** Chạm vào ô (dùng cho câu hỏi chọn ô hoặc bàn xếp thế). */
  onSquarePress?: (square: Square) => void;
  lastMove?: { from: Square; to: Square } | null;
  check?: Square | null;
  stars?: Square[];
  traps?: Square[];
  marks?: SquareMark[];
  arrows?: Arrow[];
  /** Chế độ vẽ chú thích: kéo để vẽ mũi tên, chạm để tô ô. */
  annotate?: boolean;
  onArrowsChange?: (arrows: Arrow[]) => void;
  onMarksChange?: (marks: SquareMark[]) => void;
  animate?: boolean;
  testID?: string;
}

const ANNOTATE_COLOR = 'rgba(45,164,74,0.85)';
const MARK_COLOR = 'rgba(229,72,77,0.45)';

function squareAt(x: number, y: number, size: number, orientation: Color): Square | null {
  const cell = size / 8;
  const col = Math.floor(x / cell);
  const row = Math.floor(y / cell);
  if (col < 0 || col > 7 || row < 0 || row > 7) return null;
  const file = orientation === 'w' ? col : 7 - col;
  const rank = orientation === 'w' ? 7 - row : row;
  const name = `${'abcdefgh'[file]}${rank + 1}`;
  return isSquare(name) ? name : null;
}

function squareXY(sq: Square, size: number, orientation: Color): { x: number; y: number } {
  const cell = size / 8;
  const file = sq.charCodeAt(0) - 97;
  const rank = Number(sq[1]) - 1;
  const col = orientation === 'w' ? file : 7 - file;
  const row = orientation === 'w' ? 7 - rank : rank;
  return { x: col * cell, y: row * cell };
}

function starPoints(cx: number, cy: number, r: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 === 0 ? r : r * 0.45;
    const a = (Math.PI / 5) * i - Math.PI / 2;
    pts.push(`${cx + rad * Math.cos(a)},${cy + rad * Math.sin(a)}`);
  }
  return pts.join(' ');
}

const AnimatedPiece = memo(function AnimatedPiece({
  piece,
  x,
  y,
  cell,
  from,
  hidden,
}: {
  piece: PieceT;
  x: number;
  y: number;
  cell: number;
  from?: { x: number; y: number };
  hidden?: boolean;
}) {
  const offset = useRef(
    new Animated.ValueXY(from ? { x: from.x - x, y: from.y - y } : { x: 0, y: 0 }),
  ).current;
  const fromX = from?.x;
  const fromY = from?.y;
  useEffect(() => {
    if (fromX !== undefined && fromY !== undefined) {
      Animated.timing(offset, {
        toValue: { x: 0, y: 0 },
        duration: 180,
        useNativeDriver: false,
      }).start();
    }
  }, [fromX, fromY, offset]);
  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: cell,
        height: cell,
        opacity: hidden ? 0.25 : 1,
        transform: offset.getTranslateTransform(),
      }}
    >
      <Piece type={piece.type} color={piece.color} size={cell} />
    </Animated.View>
  );
});

/** Bàn cờ tương tác dùng chung cho mọi nền tảng (iOS, Android, Web, Desktop). */
export const Board = memo(function Board({
  fen,
  size,
  orientation = 'w',
  theme = BOARD_THEMES[0]!,
  showCoords = true,
  movable = null,
  targetsOf,
  onMove,
  onSquarePress,
  lastMove,
  check,
  stars,
  traps,
  marks,
  arrows,
  annotate = false,
  onArrowsChange,
  onMarksChange,
  animate = true,
  testID,
}: BoardProps) {
  const cell = size / 8;
  const position = useMemo(() => {
    try {
      return Position.fromFen(fen);
    } catch {
      return Position.fromFen('8/8/8/8/8/8/8/8 w - - 0 1');
    }
  }, [fen]);
  const pieces = useMemo(() => position.pieces(), [position]);
  const [selected, setSelected] = useState<Square | null>(null);
  const [dragFrom, setDragFrom] = useState<Square | null>(null);
  const [draftArrow, setDraftArrow] = useState<Arrow | null>(null);
  const dragXY = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const droppedByDrag = useRef(false);
  const start = useRef<{ x: number; y: number; square: Square | null }>({
    x: 0,
    y: 0,
    square: null,
  });

  // Bỏ chọn khi thế cờ thay đổi.
  // biome-ignore lint/correctness/useExhaustiveDependencies: fen là tín hiệu kích hoạt
  useEffect(() => {
    setSelected(null);
  }, [fen]);

  const targets = useMemo(
    () => (selected && targetsOf ? targetsOf(selected) : []),
    [selected, targetsOf],
  );

  const canMovePiece = (sq: Square | null): boolean => {
    if (!sq || !movable) return false;
    const p = position.get(sq);
    if (!p) return false;
    return movable === 'both' ? p.color === position.turn : p.color === movable;
  };

  // Dùng ref để PanResponder (tạo một lần) luôn thấy props/state mới nhất.
  const latest = useRef({
    selected,
    targets,
    annotate,
    arrows,
    marks,
    onMove,
    onSquarePress,
    canMovePiece,
  });
  latest.current = {
    selected,
    targets,
    annotate,
    arrows,
    marks,
    onMove,
    onSquarePress,
    canMovePiece,
  };

  const responder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: (e: GestureResponderEvent) => {
          const { locationX, locationY } = e.nativeEvent;
          const sq = squareAt(locationX, locationY, size, orientation);
          start.current = { x: locationX, y: locationY, square: sq };
          droppedByDrag.current = false;
          const L = latest.current;
          if (L.annotate) {
            if (sq) setDraftArrow({ from: sq, to: sq, color: ANNOTATE_COLOR });
            return;
          }
          if (sq && L.canMovePiece(sq)) {
            setDragFrom(sq);
            dragXY.setValue({ x: locationX - cell / 2, y: locationY - cell / 2 });
          }
        },
        onPanResponderMove: (_e, g: PanResponderGestureState) => {
          const x = start.current.x + g.dx;
          const y = start.current.y + g.dy;
          if (latest.current.annotate) {
            const to = squareAt(x, y, size, orientation);
            setDraftArrow((a) => (a && to && a.to !== to ? { ...a, to } : a));
            return;
          }
          dragXY.setValue({ x: x - cell / 2, y: y - cell / 2 });
        },
        onPanResponderRelease: (_e, g: PanResponderGestureState) => {
          const L = latest.current;
          const x = start.current.x + g.dx;
          const y = start.current.y + g.dy;
          const end = squareAt(x, y, size, orientation);
          const from = start.current.square;
          const moved = Math.abs(g.dx) > cell / 3 || Math.abs(g.dy) > cell / 3;
          if (L.annotate) {
            setDraftArrow(null);
            if (!from || !end) return;
            if (from === end) {
              const cur = L.marks ?? [];
              const exists = cur.some((m) => m.square === from);
              onMarksChange?.(
                exists
                  ? cur.filter((m) => m.square !== from)
                  : [...cur, { square: from, color: MARK_COLOR }],
              );
            } else {
              const cur = L.arrows ?? [];
              const exists = cur.some((a) => a.from === from && a.to === end);
              onArrowsChange?.(
                exists
                  ? cur.filter((a) => !(a.from === from && a.to === end))
                  : [...cur, { from, to: end, color: ANNOTATE_COLOR }],
              );
            }
            return;
          }
          setDragFrom(null);
          if (moved && from && end && from !== end && L.canMovePiece(from)) {
            droppedByDrag.current = true;
            setSelected(null);
            L.onMove?.(from, end);
            return;
          }
          // Chạm (tap)
          if (!end) return;
          L.onSquarePress?.(end);
          if (L.selected && L.selected !== end && L.targets.includes(end)) {
            setSelected(null);
            L.onMove?.(L.selected, end);
          } else if (L.canMovePiece(end)) {
            setSelected(L.selected === end ? null : end);
          } else {
            // Chạm vào ô không đi được: vẫn báo lên để màn chơi giải thích vì sao sai.
            if (L.selected && L.selected !== end) L.onMove?.(L.selected, end);
            setSelected(null);
          }
        },
        onPanResponderTerminate: () => {
          setDragFrom(null);
          setDraftArrow(null);
        },
      }),
    [size, orientation, cell, dragXY, onArrowsChange, onMarksChange],
  );

  const lastFromXY = lastMove && animate ? squareXY(lastMove.from, size, orientation) : undefined;
  const allArrows =
    draftArrow && draftArrow.from !== draftArrow.to
      ? [...(arrows ?? []), draftArrow]
      : (arrows ?? []);

  return (
    <View
      testID={testID}
      style={[styles.board, { width: size, height: size }]}
      {...responder.panHandlers}
      accessibilityRole="image"
      accessibilityLabel="Bàn cờ"
    >
      <Svg width={size} height={size} pointerEvents="none" style={StyleSheet.absoluteFill}>
        {Array.from({ length: 64 }, (_, i) => {
          const col = i % 8;
          const row = Math.floor(i / 8);
          const light = (col + row) % 2 === 0;
          return (
            <Rect
              key={i}
              x={col * cell}
              y={row * cell}
              width={cell}
              height={cell}
              fill={light ? theme.light : theme.dark}
            />
          );
        })}
        {lastMove &&
          [lastMove.from, lastMove.to].map((sq) => {
            const p = squareXY(sq, size, orientation);
            return (
              <Rect
                key={`lm-${sq}`}
                x={p.x}
                y={p.y}
                width={cell}
                height={cell}
                fill={theme.lastMove}
              />
            );
          })}
        {(marks ?? []).map((m) => {
          const p = squareXY(m.square, size, orientation);
          return (
            <Rect
              key={`mk-${m.square}`}
              x={p.x}
              y={p.y}
              width={cell}
              height={cell}
              fill={m.color}
            />
          );
        })}
        {selected &&
          (() => {
            const p = squareXY(selected, size, orientation);
            return <Rect x={p.x} y={p.y} width={cell} height={cell} fill={theme.selected} />;
          })()}
        {check &&
          (() => {
            const p = squareXY(check, size, orientation);
            return (
              <Circle
                cx={p.x + cell / 2}
                cy={p.y + cell / 2}
                r={cell * 0.48}
                fill="rgba(229,72,77,0.55)"
              />
            );
          })()}
        {(traps ?? []).map((sq) => {
          const p = squareXY(sq, size, orientation);
          const pad = cell * 0.3;
          return (
            <G key={`tr-${sq}`} opacity={0.75}>
              <Rect x={p.x} y={p.y} width={cell} height={cell} fill="rgba(229,72,77,0.18)" />
              <Line
                x1={p.x + pad}
                y1={p.y + pad}
                x2={p.x + cell - pad}
                y2={p.y + cell - pad}
                stroke={colors.red}
                strokeWidth={cell * 0.07}
                strokeLinecap="round"
              />
              <Line
                x1={p.x + cell - pad}
                y1={p.y + pad}
                x2={p.x + pad}
                y2={p.y + cell - pad}
                stroke={colors.red}
                strokeWidth={cell * 0.07}
                strokeLinecap="round"
              />
            </G>
          );
        })}
        {(stars ?? []).map((sq) => {
          const p = squareXY(sq, size, orientation);
          return (
            <Polygon
              key={`st-${sq}`}
              points={starPoints(p.x + cell / 2, p.y + cell / 2, cell * 0.38)}
              fill={colors.gold}
              stroke={colors.orange}
              strokeWidth={cell * 0.04}
              strokeLinejoin="round"
            />
          );
        })}
        {showCoords &&
          Array.from({ length: 8 }, (_, i) => {
            const fileChar = 'abcdefgh'[orientation === 'w' ? i : 7 - i]!;
            const rankChar = String(orientation === 'w' ? 8 - i : i + 1);
            const fs = Math.max(9, cell * 0.2);
            return (
              <G key={`c-${i}`}>
                <SvgText
                  x={i * cell + cell - fs * 0.35}
                  y={size - fs * 0.3}
                  fontSize={fs}
                  fontFamily={fonts.bold}
                  textAnchor="end"
                  fill={(i + 7) % 2 === 0 ? theme.coordLight : theme.coordDark}
                >
                  {fileChar}
                </SvgText>
                <SvgText
                  x={fs * 0.3}
                  y={i * cell + fs}
                  fontSize={fs}
                  fontFamily={fonts.bold}
                  fill={i % 2 === 0 ? theme.coordLight : theme.coordDark}
                >
                  {rankChar}
                </SvgText>
              </G>
            );
          })}
      </Svg>

      {pieces.map(({ square, piece }) => {
        const p = squareXY(square, size, orientation);
        const isLastTo = lastMove?.to === square;
        return (
          <AnimatedPiece
            key={`${square}-${piece.color}${piece.type}-${isLastTo ? `${lastMove?.from}` : ''}`}
            piece={piece}
            x={p.x}
            y={p.y}
            cell={cell}
            from={isLastTo && !droppedByDrag.current ? lastFromXY : undefined}
            hidden={dragFrom === square}
          />
        );
      })}

      <Svg width={size} height={size} pointerEvents="none" style={StyleSheet.absoluteFill}>
        {targets.map((sq) => {
          const p = squareXY(sq, size, orientation);
          const occupied = position.get(sq) !== null;
          return occupied ? (
            <Circle
              key={`t-${sq}`}
              cx={p.x + cell / 2}
              cy={p.y + cell / 2}
              r={cell * 0.44}
              fill="none"
              stroke="rgba(27,36,102,0.35)"
              strokeWidth={cell * 0.08}
            />
          ) : (
            <Circle
              key={`t-${sq}`}
              cx={p.x + cell / 2}
              cy={p.y + cell / 2}
              r={cell * 0.15}
              fill="rgba(27,36,102,0.35)"
            />
          );
        })}
        {allArrows.map((a, i) => {
          const f = squareXY(a.from, size, orientation);
          const t = squareXY(a.to, size, orientation);
          const x1 = f.x + cell / 2;
          const y1 = f.y + cell / 2;
          const x2 = t.x + cell / 2;
          const y2 = t.y + cell / 2;
          const ang = Math.atan2(y2 - y1, x2 - x1);
          const head = cell * 0.38;
          const sx = x2 - Math.cos(ang) * head * 0.8;
          const sy = y2 - Math.sin(ang) * head * 0.8;
          const left = `${x2 - head * Math.cos(ang - 0.5)},${y2 - head * Math.sin(ang - 0.5)}`;
          const right = `${x2 - head * Math.cos(ang + 0.5)},${y2 - head * Math.sin(ang + 0.5)}`;
          const color = a.color ?? ANNOTATE_COLOR;
          return (
            <G key={`a-${i}`}>
              <Line
                x1={x1}
                y1={y1}
                x2={sx}
                y2={sy}
                stroke={color}
                strokeWidth={cell * 0.16}
                strokeLinecap="round"
              />
              <Polygon points={`${x2},${y2} ${left} ${right}`} fill={color} />
            </G>
          );
        })}
      </Svg>

      {dragFrom &&
        (() => {
          const piece = position.get(dragFrom);
          if (!piece) return null;
          return (
            <Animated.View
              pointerEvents="none"
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: cell * 1.15,
                height: cell * 1.15,
                transform: dragXY.getTranslateTransform(),
              }}
            >
              <Piece type={piece.type} color={piece.color} size={cell * 1.15} />
            </Animated.View>
          );
        })()}
    </View>
  );
});

const styles = StyleSheet.create({
  board: {
    position: 'relative',
    borderRadius: 6,
    overflow: 'hidden',
    userSelect: 'none',
  },
});
