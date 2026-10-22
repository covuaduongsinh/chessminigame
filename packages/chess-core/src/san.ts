import type { Position } from './position';
import { FILES, fileOf, rankOf, squareIndex, squareName, typeOfCode } from './squares';
import { type Move, MoveFlag, type PieceType } from './types';

export function moveToUci(m: Move): string {
  return `${squareName(m.from)}${squareName(m.to)}${m.promotion ?? ''}`;
}

/** Tìm nước hợp lệ theo UCI (ví dụ "e2e4", "e7e8q"). */
export function findUci(pos: Position, uci: string): Move | undefined {
  if (!/^[a-h][1-8][a-h][1-8][qrbn]?$/.test(uci)) return undefined;
  const from = squareIndex(uci.slice(0, 2));
  const to = squareIndex(uci.slice(2, 4));
  const promo = (uci[4] as PieceType | undefined) ?? undefined;
  return pos
    .legalMoves()
    .find((m) => m.from === from && m.to === to && (m.promotion ?? undefined) === promo);
}

/** SAN không có hậu tố +/#. `legal` là danh sách nước hợp lệ của thế hiện tại. */
function sanCore(m: Move, legal: Move[]): string {
  if (m.flags & MoveFlag.CastleKing) return 'O-O';
  if (m.flags & MoveFlag.CastleQueen) return 'O-O-O';
  const type = typeOfCode(m.piece);
  const to = squareName(m.to);
  const capture = (m.flags & MoveFlag.Capture) !== 0;
  if (type === 'p') {
    let s = capture ? `${FILES[fileOf(m.from)]}x${to}` : to;
    if (m.promotion) s += `=${m.promotion.toUpperCase()}`;
    return s;
  }
  let disamb = '';
  const rivals = legal.filter(
    (o) => o.piece === m.piece && o.to === m.to && o.from !== m.from && !o.promotion,
  );
  if (rivals.length) {
    const sameFile = rivals.some((o) => fileOf(o.from) === fileOf(m.from));
    const sameRank = rivals.some((o) => rankOf(o.from) === rankOf(m.from));
    if (!sameFile) disamb = FILES[fileOf(m.from)]!;
    else if (!sameRank) disamb = String(rankOf(m.from) + 1);
    else disamb = squareName(m.from);
  }
  return `${type.toUpperCase()}${disamb}${capture ? 'x' : ''}${to}`;
}

export function toSan(pos: Position, m: Move, legal: Move[] = pos.legalMoves()): string {
  let s = sanCore(m, legal);
  pos.make(m);
  if (pos.inCheck()) s += pos.legalMoves().length === 0 ? '#' : '+';
  pos.unmake();
  return s;
}

function normalizeSan(san: string): string {
  return san
    .trim()
    .replace(/[+#!?]+$/g, '')
    .replace(/^0-0-0/, 'O-O-O')
    .replace(/^0-0/, 'O-O')
    .replace(/e\.p\.$/, '')
    .replace(/([a-h][18])([QRBN])$/, '$1=$2');
}

/** Tìm nước hợp lệ theo SAN (chấp nhận "e8Q", "0-0", hậu tố !?). Trả về undefined nếu không khớp. */
export function parseSan(pos: Position, san: string): Move | undefined {
  const target = normalizeSan(san);
  const legal = pos.legalMoves();
  const exact = legal.find((m) => sanCore(m, legal) === target);
  if (exact) return exact;
  // Một số nguồn ghi thừa phân biệt (Ngf3 khi không cần) hoặc ghi "Pe4".
  const loose = target.replace(/^P/, '');
  const match = /^([NBRQK])?([a-h])?([1-8])?x?([a-h][1-8])(=?[QRBN])?$/.exec(loose);
  if (!match) return findUci(pos, san.trim());
  const [, piece, file, rank, to, promo] = match;
  const toIdx = squareIndex(to!);
  const candidates = legal.filter((m) => {
    if (m.to !== toIdx) return false;
    const t = typeOfCode(m.piece);
    if ((piece ? piece.toLowerCase() : 'p') !== t) return false;
    if (file && FILES[fileOf(m.from)] !== file) return false;
    if (rank && String(rankOf(m.from) + 1) !== rank) return false;
    const p = promo?.replace('=', '').toLowerCase();
    return (m.promotion ?? '') === (p ?? '');
  });
  return candidates.length === 1 ? candidates[0] : undefined;
}
