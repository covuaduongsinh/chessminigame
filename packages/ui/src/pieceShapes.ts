import type { PieceType } from '@duongsinh/chess-core';

/**
 * Bộ quân "Dương Sinh" tự vẽ (viewBox 0 0 100 100): khối đơn giản, nét đậm, dễ nhận ra với trẻ nhỏ.
 * role: body = thân quân, detail = chi tiết nhấn (đai, ngọc), line = nét vẽ không tô.
 */
export type ShapeRole = 'body' | 'detail' | 'line';

export type Shape =
  | { kind: 'path'; d: string; role: ShapeRole }
  | { kind: 'circle'; cx: number; cy: number; r: number; role: ShapeRole }
  | { kind: 'rect'; x: number; y: number; w: number; h: number; rx: number; role: ShapeRole };

const BASE: Shape = { kind: 'rect', x: 20, y: 84, w: 60, h: 10, rx: 4, role: 'body' };

export const PIECE_SHAPES: Record<PieceType, Shape[]> = {
  p: [
    { kind: 'path', d: 'M34 85 C34 70 40 60 44 52 H56 C60 60 66 70 66 85 Z', role: 'body' },
    { kind: 'rect', x: 37, y: 45, w: 26, h: 8, rx: 4, role: 'detail' },
    { kind: 'circle', cx: 50, cy: 31, r: 13, role: 'body' },
    BASE,
  ],
  r: [
    { kind: 'path', d: 'M31 85 L35 47 H65 L69 85 Z', role: 'body' },
    { kind: 'rect', x: 29, y: 41, w: 42, h: 8, rx: 3, role: 'detail' },
    {
      kind: 'path',
      d: 'M27 16 H38 V25 H45 V16 H55 V25 H62 V16 H73 V37 Q73 42 68 42 H32 Q27 42 27 37 Z',
      role: 'body',
    },
    BASE,
  ],
  n: [
    {
      kind: 'path',
      d: 'M29 85 C29 71 35 63 45 56 C37 57 30 61 24 59 C17 57 15 50 20 45 L38 29 C40 21 46 15 53 13 L56 5 L62 14 C75 20 81 39 79 59 C78 70 75 78 73 85 Z',
      role: 'body',
    },
    { kind: 'circle', cx: 47, cy: 29, r: 3.6, role: 'detail' },
    { kind: 'path', d: 'M58 22 C66 32 69 46 66 62', role: 'line' },
    { kind: 'path', d: 'M22 49 L27 47', role: 'line' },
    BASE,
  ],
  b: [
    { kind: 'path', d: 'M37 61 C37 71 33 79 29 85 H71 C67 79 63 71 63 61 Z', role: 'body' },
    { kind: 'rect', x: 34, y: 54, w: 32, h: 8, rx: 4, role: 'detail' },
    { kind: 'path', d: 'M50 19 C65 29 70 43 63 55 H37 C30 43 35 29 50 19 Z', role: 'body' },
    { kind: 'path', d: 'M54 31 L45 44', role: 'line' },
    { kind: 'circle', cx: 50, cy: 13, r: 6.5, role: 'detail' },
    BASE,
  ],
  q: [
    { kind: 'path', d: 'M30 71 C30 78 26 81 24 85 H76 C74 81 70 78 70 71 Z', role: 'body' },
    { kind: 'rect', x: 27, y: 63, w: 46, h: 8, rx: 4, role: 'detail' },
    {
      kind: 'path',
      d: 'M17 33 L29 64 H71 L83 33 L65 52 L66 23 L55 48 L50 18 L45 48 L34 23 L35 52 Z',
      role: 'body',
    },
    { kind: 'circle', cx: 17, cy: 31, r: 5, role: 'detail' },
    { kind: 'circle', cx: 34, cy: 21, r: 5, role: 'detail' },
    { kind: 'circle', cx: 50, cy: 15, r: 5.5, role: 'detail' },
    { kind: 'circle', cx: 66, cy: 21, r: 5, role: 'detail' },
    { kind: 'circle', cx: 83, cy: 31, r: 5, role: 'detail' },
    BASE,
  ],
  k: [
    { kind: 'path', d: 'M33 71 C33 78 29 81 27 85 H73 C71 81 67 78 67 71 Z', role: 'body' },
    { kind: 'rect', x: 30, y: 63, w: 40, h: 8, rx: 4, role: 'detail' },
    {
      kind: 'path',
      d: 'M24 41 C24 31 36 27 44 34 L50 40 L56 34 C64 27 76 31 76 41 C76 52 68 59 66 64 H34 C32 59 24 52 24 41 Z',
      role: 'body',
    },
    { kind: 'rect', x: 46, y: 5, w: 8, h: 28, rx: 2, role: 'detail' },
    { kind: 'rect', x: 38, y: 12, w: 24, h: 8, rx: 2, role: 'detail' },
    BASE,
  ],
};

export interface PiecePalette {
  fill: string;
  stroke: string;
  detail: string;
}

export const PIECE_PALETTE: Record<'w' | 'b', PiecePalette> = {
  w: { fill: '#FFFFFF', stroke: '#1B2466', detail: '#DCE1F4' },
  b: { fill: '#1B2466', stroke: '#0B1033', detail: '#FBB040' },
};
