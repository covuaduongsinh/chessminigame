import {
  explainIllegalMove,
  type IllegalReason,
  type PieceType,
  type Position,
  type Square,
} from '@duongsinh/chess-core';
import type { L10n } from './types';

const PIECE: Record<PieceType, L10n> = {
  p: { vi: 'Tốt', en: 'pawn' },
  n: { vi: 'Mã', en: 'knight' },
  b: { vi: 'Tượng', en: 'bishop' },
  r: { vi: 'Xe', en: 'rook' },
  q: { vi: 'Hậu', en: 'queen' },
  k: { vi: 'Vua', en: 'king' },
};

const HOW: Record<PieceType, L10n> = {
  p: {
    vi: 'Tốt đi thẳng về phía trước 1 ô (nước đầu được đi 2 ô) và ăn chéo.',
    en: 'Pawns move straight ahead one square (two on the first move) and capture diagonally.',
  },
  n: {
    vi: 'Mã đi hình chữ L: 2 ô thẳng rồi 1 ô ngang.',
    en: 'Knights move in an L: two squares straight, then one to the side.',
  },
  b: { vi: 'Tượng chỉ đi theo đường chéo.', en: 'Bishops only move diagonally.' },
  r: {
    vi: 'Xe chỉ đi thẳng theo hàng ngang hoặc cột dọc.',
    en: 'Rooks only move straight along ranks and files.',
  },
  q: {
    vi: 'Hậu đi thẳng hoặc đi chéo, nhưng không rẽ giữa chừng.',
    en: 'Queens move straight or diagonally, without turning.',
  },
  k: { vi: 'Vua chỉ đi 1 ô theo mọi hướng.', en: 'Kings move one square in any direction.' },
};

const fill = (t: L10n, p: PieceType | null): L10n =>
  p ? { vi: t.vi.replace('{p}', PIECE[p].vi), en: t.en.replace('{p}', PIECE[p].en) } : t;

const MESSAGES: Record<IllegalReason | 'must-capture', L10n> = {
  'no-piece': { vi: 'Ô này không có quân nào.', en: 'There is no piece on that square.' },
  'not-your-turn': {
    vi: 'Đó là quân của đối phương — em chỉ đi quân của mình nhé.',
    en: "That's your opponent's piece — move your own.",
  },
  'own-piece': {
    vi: 'Không được ăn quân của chính mình!',
    en: "You can't capture your own piece!",
  },
  'same-square': {
    vi: 'Quân phải rời khỏi ô đang đứng.',
    en: 'The piece has to leave its square.',
  },
  'pawn-backward': { vi: 'Tốt không bao giờ đi lùi.', en: 'Pawns never move backwards.' },
  'pawn-blocked': {
    vi: 'Có quân chắn đường phía trước Tốt.',
    en: 'Something is blocking the pawn.',
  },
  'pawn-diagonal-empty': {
    vi: 'Tốt chỉ đi chéo khi ăn quân.',
    en: 'Pawns only move diagonally when capturing.',
  },
  'pawn-straight-capture': {
    vi: 'Tốt không ăn thẳng — Tốt ăn chéo.',
    en: "Pawns don't capture straight ahead — they capture diagonally.",
  },
  blocked: {
    vi: '{p} không nhảy qua được quân khác — đường đi đang bị chắn.',
    en: "The {p} can't jump over pieces — the way is blocked.",
  },
  'cannot-move-like-that': {
    vi: '{p} không đi như vậy được.',
    en: "The {p} can't move like that.",
  },
  'castle-rule': {
    vi: 'Chưa nhập thành được: Vua/Xe đã đi, có quân đứng giữa, hoặc Vua đang bị chiếu / phải đi qua ô bị tấn công.',
    en: "You can't castle now: the king or rook has moved, a piece is in the way, or the king is in check or would cross an attacked square.",
  },
  'in-check': {
    vi: 'Vua đang bị chiếu! Phải thoát chiếu trước: chạy Vua, bắt quân chiếu hoặc chặn đường.',
    en: 'Your king is in check! Escape first: move, capture or block.',
  },
  pinned: {
    vi: '{p} đang bị ghim — nếu đi, Vua sẽ bị chiếu.',
    en: 'That {p} is pinned — moving it would expose your king.',
  },
  'king-into-check': {
    vi: 'Vua không được đi vào ô đang bị tấn công.',
    en: "The king can't move into an attacked square.",
  },
  'must-capture': {
    vi: 'Trong bài này, nước nào cũng phải ăn một quân!',
    en: 'In this game every move must capture!',
  },
};

/** Lời giải thích thân thiện cho trẻ khi đi sai (null nếu nước đi hợp lệ). */
export function illegalMessage(pos: Position, from: Square, to: Square): L10n | null {
  const e = explainIllegalMove(pos, from, to);
  if (!e) return null;
  const base = fill(MESSAGES[e.reason], e.piece);
  if (e.reason === 'cannot-move-like-that' && e.piece) {
    const how = HOW[e.piece];
    return { vi: `${base.vi} ${how.vi}`, en: `${base.en} ${how.en}` };
  }
  return base;
}

export const MUST_CAPTURE_MESSAGE = MESSAGES['must-capture'];
