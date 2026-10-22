import type { Position } from './position';
import { fileOf, rankOf, squareIndex, typeOfCode } from './squares';
import type { PieceType, Square } from './types';

/** Lý do một nước đi không hợp lệ — để hướng dẫn trẻ thay vì chỉ báo "sai". */
export type IllegalReason =
  | 'no-piece'
  | 'not-your-turn'
  | 'own-piece'
  | 'same-square'
  | 'pawn-backward'
  | 'pawn-blocked'
  | 'pawn-diagonal-empty'
  | 'pawn-straight-capture'
  | 'blocked'
  | 'cannot-move-like-that'
  | 'castle-rule'
  | 'in-check'
  | 'pinned'
  | 'king-into-check';

export interface IllegalExplanation {
  reason: IllegalReason;
  piece: PieceType | null;
}

function pathClear(pos: Position, from: number, to: number, step: number): boolean {
  for (let s = from + step; s !== to; s += step) if (pos.board[s]) return false;
  return true;
}

/**
 * Giải thích vì sao from→to không hợp lệ. Trả về null nếu nước đi thực ra hợp lệ.
 * Dùng chung cho mini-game, chơi với máy và bàn phân tích.
 */
export function explainIllegalMove(
  pos: Position,
  from: Square,
  to: Square,
): IllegalExplanation | null {
  const f = squareIndex(from);
  const t = squareIndex(to);
  const code = pos.board[f]!;
  if (!code) return { reason: 'no-piece', piece: null };
  const piece = typeOfCode(code);
  const black = (code & 8) !== 0;
  if ((black ? 1 : 0) !== pos.side) return { reason: 'not-your-turn', piece };
  if (f === t) return { reason: 'same-square', piece };
  const legal = pos.legalMoves();
  if (legal.some((m) => m.from === f && m.to === t)) return null;
  const target = pos.board[t]!;
  if (target && (target & 8) === (code & 8)) return { reason: 'own-piece', piece };

  // Nước giả hợp lệ nhưng bị cấm vì để Vua bị chiếu.
  if (pos.pseudoMoves().some((m) => m.from === f && m.to === t)) {
    if (piece === 'k') return { reason: 'king-into-check', piece };
    return { reason: pos.inCheck() ? 'in-check' : 'pinned', piece };
  }

  const df = fileOf(t) - fileOf(f);
  const dr = rankOf(t) - rankOf(f);
  const forward = black ? -1 : 1;
  switch (piece) {
    case 'p': {
      if (dr * forward < 0) return { reason: 'pawn-backward', piece };
      if (dr === 0) return { reason: 'cannot-move-like-that', piece };
      if (df === 0) {
        if (target) return { reason: 'pawn-straight-capture', piece };
        const startRank = black ? 6 : 1;
        if (Math.abs(dr) === 2 && rankOf(f) !== startRank)
          return { reason: 'cannot-move-like-that', piece };
        if (Math.abs(dr) <= 2) return { reason: 'pawn-blocked', piece };
        return { reason: 'cannot-move-like-that', piece };
      }
      if (Math.abs(df) === 1 && dr === forward && !target)
        return { reason: 'pawn-diagonal-empty', piece };
      return { reason: 'cannot-move-like-that', piece };
    }
    case 'n':
      return { reason: 'cannot-move-like-that', piece };
    case 'k':
      if (dr === 0 && Math.abs(df) === 2) return { reason: 'castle-rule', piece };
      return { reason: 'cannot-move-like-that', piece };
    default: {
      const straight = df === 0 || dr === 0;
      const diagonal = Math.abs(df) === Math.abs(dr);
      const ok = piece === 'r' ? straight : piece === 'b' ? diagonal : straight || diagonal;
      if (!ok) return { reason: 'cannot-move-like-that', piece };
      const step = Math.sign(dr) * 16 + Math.sign(df);
      if (!pathClear(pos, f, t, step)) return { reason: 'blocked', piece };
      return { reason: 'cannot-move-like-that', piece };
    }
  }
}
