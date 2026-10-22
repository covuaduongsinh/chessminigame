export type Color = 'w' | 'b';
export type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';

export interface Piece {
  color: Color;
  type: PieceType;
}

export type File = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h';
export type Rank = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8';
export type Square = `${File}${Rank}`;

/** Cờ đánh dấu loại nước đi (bitmask). */
export const MoveFlag = {
  Normal: 0,
  Capture: 1,
  EnPassant: 2,
  CastleKing: 4,
  CastleQueen: 8,
  DoublePush: 16,
  Promotion: 32,
} as const;

/** Nước đi. `from`/`to` là chỉ số ô dạng 0x88 (dùng `squareName` để đổi sang "e4"). */
export interface Move {
  from: number;
  to: number;
  /** Mã quân đang đi (xem `pieceCode`). */
  piece: number;
  /** Mã quân bị bắt, 0 nếu không bắt. */
  captured: number;
  /** Loại quân phong cấp, nếu có. */
  promotion?: PieceType;
  flags: number;
}

export type Outcome =
  | { kind: 'checkmate'; winner: Color }
  | { kind: 'stalemate' }
  | { kind: 'fifty-move' }
  | { kind: 'threefold' }
  | { kind: 'insufficient' };
