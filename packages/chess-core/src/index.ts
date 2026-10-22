export { Game, type HistoryEntry, resultString } from './game';
export { PgnError, type PgnGame, type PgnMove, parsePgn, splitPgn, toPgn } from './pgn';
export { Position, START_FEN } from './position';
export { findUci, moveToUci, parseSan, toSan } from './san';
export {
  ALL_SQUARES,
  codeToPiece,
  colorOfCode,
  FILES,
  fileOf,
  isLightSquare,
  isSquare,
  pieceCode,
  rankOf,
  squareIndex,
  squareName,
  typeOfCode,
} from './squares';
export * from './types';

import type { Position } from './position';

/** Đếm số nút perft (kiểm tra bộ sinh nước). */
export function perft(pos: Position, depth: number): number {
  if (depth === 0) return 1;
  const moves = pos.legalMoves();
  if (depth === 1) return moves.length;
  let n = 0;
  for (const m of moves) {
    pos.make(m);
    n += perft(pos, depth - 1);
    pos.unmake();
  }
  return n;
}
