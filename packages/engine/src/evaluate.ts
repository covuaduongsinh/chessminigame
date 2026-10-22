import type { Position } from '@duongsinh/chess-core';

/** Giá trị quân (centipawn), theo mã loại 1..6: Tốt, Mã, Tượng, Xe, Hậu, Vua. */
export const PIECE_VALUE = [0, 100, 320, 330, 500, 900, 0];

// Bảng vị trí theo góc nhìn Trắng, chỉ số [hàng 0..7 (hàng 1..8)][cột 0..7].
const PAWN_PST = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [5, 10, 10, -20, -20, 10, 10, 5],
  [5, -5, -10, 0, 0, -10, -5, 5],
  [0, 0, 5, 20, 20, 5, 0, 0],
  [5, 5, 10, 25, 25, 10, 5, 5],
  [10, 15, 20, 30, 30, 20, 15, 10],
  [50, 50, 50, 50, 50, 50, 50, 50],
  [0, 0, 0, 0, 0, 0, 0, 0],
];
const KNIGHT_PST = [
  [-50, -40, -30, -30, -30, -30, -40, -50],
  [-40, -20, 0, 5, 5, 0, -20, -40],
  [-30, 5, 10, 15, 15, 10, 5, -30],
  [-30, 0, 15, 20, 20, 15, 0, -30],
  [-30, 5, 15, 20, 20, 15, 5, -30],
  [-30, 0, 10, 15, 15, 10, 0, -30],
  [-40, -20, 0, 0, 0, 0, -20, -40],
  [-50, -40, -30, -30, -30, -30, -40, -50],
];
const BISHOP_PST = [
  [-20, -10, -10, -10, -10, -10, -10, -20],
  [-10, 5, 0, 0, 0, 0, 5, -10],
  [-10, 10, 10, 10, 10, 10, 10, -10],
  [-10, 0, 10, 10, 10, 10, 0, -10],
  [-10, 5, 5, 10, 10, 5, 5, -10],
  [-10, 0, 5, 10, 10, 5, 0, -10],
  [-10, 0, 0, 0, 0, 0, 0, -10],
  [-20, -10, -10, -10, -10, -10, -10, -20],
];
const ROOK_PST = [
  [0, 0, 0, 5, 5, 0, 0, 0],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [5, 10, 10, 10, 10, 10, 10, 5],
  [0, 0, 0, 0, 0, 0, 0, 0],
];
const QUEEN_PST = [
  [-20, -10, -10, -5, -5, -10, -10, -20],
  [-10, 0, 5, 0, 0, 0, 0, -10],
  [-10, 5, 5, 5, 5, 5, 0, -10],
  [0, 0, 5, 5, 5, 5, 0, -5],
  [-5, 0, 5, 5, 5, 5, 0, -5],
  [-10, 0, 5, 5, 5, 5, 0, -10],
  [-10, 0, 0, 0, 0, 0, 0, -10],
  [-20, -10, -10, -5, -5, -10, -10, -20],
];
const KING_MID_PST = [
  [20, 30, 10, 0, 0, 10, 30, 20],
  [20, 20, 0, 0, 0, 0, 20, 20],
  [-10, -20, -20, -20, -20, -20, -20, -10],
  [-20, -30, -30, -40, -40, -30, -30, -20],
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-30, -40, -40, -50, -50, -40, -40, -30],
];
const KING_END_PST = [
  [-50, -30, -30, -30, -30, -30, -30, -50],
  [-30, -30, 0, 0, 0, 0, -30, -30],
  [-30, -10, 20, 30, 30, 20, -10, -30],
  [-30, -10, 30, 40, 40, 30, -10, -30],
  [-30, -10, 30, 40, 40, 30, -10, -30],
  [-30, -10, 20, 30, 30, 20, -10, -30],
  [-30, -20, -10, 0, 0, -10, -20, -30],
  [-50, -40, -30, -20, -20, -30, -40, -50],
];
const PST = [null, PAWN_PST, KNIGHT_PST, BISHOP_PST, ROOK_PST, QUEEN_PST] as const;

const PHASE_WEIGHT = [0, 0, 1, 1, 2, 4, 0];

/** Đánh giá tĩnh theo góc nhìn Trắng (centipawn). */
export function evaluateWhite(pos: Position): number {
  const b = pos.board;
  let mg = 0;
  let phase = 0;
  let wBishops = 0;
  let bBishops = 0;
  let wMaterial = 0;
  let bMaterial = 0;
  for (let i = 0; i < 128; i++) {
    if (i & 0x88) {
      i += 7;
      continue;
    }
    const c = b[i]!;
    if (!c) continue;
    const t = c & 7;
    const black = (c & 8) !== 0;
    const file = i & 7;
    const rank = black ? 7 - (i >> 4) : i >> 4;
    phase += PHASE_WEIGHT[t]!;
    let v = PIECE_VALUE[t]!;
    if (t !== 6) v += PST[t]![rank]![file]!;
    if (black) {
      mg -= v;
      bMaterial += PIECE_VALUE[t]!;
      if (t === 3) bBishops++;
    } else {
      mg += v;
      wMaterial += PIECE_VALUE[t]!;
      if (t === 3) wBishops++;
    }
  }
  // Vua: trộn bảng trung cuộc/tàn cuộc theo giai đoạn ván.
  const p = Math.min(phase, 24) / 24;
  for (let side = 0; side < 2; side++) {
    const k = pos.kings[side]!;
    if (k === -1) continue;
    const file = k & 7;
    const rank = side === 1 ? 7 - (k >> 4) : k >> 4;
    const v = p * KING_MID_PST[rank]![file]! + (1 - p) * KING_END_PST[rank]![file]!;
    mg += side === 0 ? v : -v;
  }
  if (wBishops >= 2) mg += 30;
  if (bBishops >= 2) mg -= 30;
  // Tàn cuộc thắng thế: khuyến khích dồn Vua đối phương vào góc và áp sát Vua mình.
  const wk = pos.kings[0]!;
  const bk = pos.kings[1]!;
  if (wk !== -1 && bk !== -1 && p < 0.35) {
    const diff = wMaterial - bMaterial;
    if (Math.abs(diff) >= 300) {
      const loserK = diff > 0 ? bk : wk;
      const winnerK = diff > 0 ? wk : bk;
      const lf = loserK & 7;
      const lr = loserK >> 4;
      const centerDist = Math.max(3 - lf, lf - 4) + Math.max(3 - lr, lr - 4);
      const kingDist = Math.abs((winnerK & 7) - lf) + Math.abs((winnerK >> 4) - lr);
      const bonus = centerDist * 10 + (14 - kingDist) * 4;
      mg += diff > 0 ? bonus : -bonus;
    }
  }
  return Math.round(mg);
}
