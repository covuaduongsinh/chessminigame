import type { Color, Piece, PieceType, Square } from './types';

/** Bàn cờ dạng 0x88: chỉ số = hàng * 16 + cột. Ô hợp lệ khi (i & 0x88) === 0. */
export const FILES = 'abcdefgh';

export function squareIndex(name: Square | string): number {
  const f = name.charCodeAt(0) - 97;
  const r = name.charCodeAt(1) - 49;
  if (f < 0 || f > 7 || r < 0 || r > 7 || name.length !== 2) {
    throw new Error(`Ô không hợp lệ: ${name}`);
  }
  return r * 16 + f;
}

export function squareName(i: number): Square {
  return `${FILES[i & 7]}${(i >> 4) + 1}` as Square;
}

export function isSquare(name: string): name is Square {
  return /^[a-h][1-8]$/.test(name);
}

export const fileOf = (i: number): number => i & 7;
export const rankOf = (i: number): number => i >> 4;
export const onBoard = (i: number): boolean => i >= 0 && i < 128 && (i & 0x88) === 0;

/** Tất cả 64 ô, từ a1 đến h8. */
export const ALL_SQUARES: Square[] = (() => {
  const out: Square[] = [];
  for (let r = 0; r < 8; r++) for (let f = 0; f < 8; f++) out.push(squareName(r * 16 + f));
  return out;
})();

export function isLightSquare(name: Square): boolean {
  const i = squareIndex(name);
  return (fileOf(i) + rankOf(i)) % 2 === 1;
}

// Mã quân: bit 3 = màu (0 trắng, 8 đen), 3 bit thấp = loại.
export const PAWN = 1;
export const KNIGHT = 2;
export const BISHOP = 3;
export const ROOK = 4;
export const QUEEN = 5;
export const KING = 6;
export const BLACK = 8;

const TYPE_CHARS = ' pnbrqk';

export function pieceCode(piece: Piece): number {
  return TYPE_CHARS.indexOf(piece.type) | (piece.color === 'b' ? BLACK : 0);
}

export function codeToPiece(code: number): Piece | null {
  if (code === 0) return null;
  return { color: code & BLACK ? 'b' : 'w', type: TYPE_CHARS[code & 7] as PieceType };
}

export function typeOfCode(code: number): PieceType {
  return TYPE_CHARS[code & 7] as PieceType;
}

export function colorOfCode(code: number): Color {
  return code & BLACK ? 'b' : 'w';
}

export function typeIndex(type: PieceType): number {
  return TYPE_CHARS.indexOf(type);
}
