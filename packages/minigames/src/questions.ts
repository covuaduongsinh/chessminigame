import {
  FILES,
  isLightSquare,
  MoveFlag,
  Position,
  type Square,
  squareName,
} from '@duongsinh/chess-core';
import { knightDistance } from './rules';
import type { L10n, Question } from './types';

const t = (vi: string, en: string): L10n => ({ vi, en });

export const EMPTY_FEN = '8/8/8/8/8/8/8/8 w - - 0 1';

export function fileSquares(file: string): Square[] {
  return Array.from({ length: 8 }, (_, r) => `${file}${r + 1}` as Square);
}

export function rankSquares(rank: number): Square[] {
  return Array.from({ length: 8 }, (_, f) => `${FILES[f]}${rank}` as Square);
}

/** Các ô trên đường chéo từ `from` tới `to` (gồm cả hai đầu). */
export function diagonal(from: Square, to: Square): Square[] {
  const f0 = from.charCodeAt(0) - 97;
  const r0 = Number(from[1]) - 1;
  const f1 = to.charCodeAt(0) - 97;
  const r1 = Number(to[1]) - 1;
  const n = Math.abs(f1 - f0);
  if (n !== Math.abs(r1 - r0)) throw new Error(`${from}-${to} không phải đường chéo`);
  const df = Math.sign(f1 - f0);
  const dr = Math.sign(r1 - r0);
  return Array.from({ length: n + 1 }, (_, i) => squareName((r0 + dr * i) * 16 + f0 + df * i));
}

export function squaresQuestion(
  prompt: L10n,
  answer: Square[],
  fen?: string,
  highlight?: Square[],
): Question {
  return {
    kind: 'squares',
    prompt,
    answer,
    ...(fen ? { fen } : {}),
    ...(highlight ? { highlight } : {}),
  };
}

/** "Chạm vào tất cả các ô mà quân ở `from` khống chế." */
export function attacksQuestion(fen: string, from: Square, prompt: L10n): Question {
  const answer = Position.fromFen(fen).attacksFrom(from);
  return { kind: 'squares', prompt, fen, answer, highlight: [from] };
}

/** "Chạm vào tất cả các ô quân ở `from` có thể đi tới." */
export function movesQuestion(fen: string, from: Square, prompt: L10n): Question {
  const pos = Position.fromFen(fen);
  const answer = [...new Set(pos.movesFrom(from).map((m) => squareName(m.to)))];
  if (answer.length === 0) throw new Error(`Quân ở ${from} không có nước đi: ${fen}`);
  return { kind: 'squares', prompt, fen, answer, highlight: [from] };
}

const OUTCOME_OPTIONS = [
  t('Chiếu hết', 'Checkmate'),
  t('Hết nước đi (hòa)', 'Stalemate (draw)'),
  t('Chưa kết thúc', 'Game goes on'),
];

export function outcomeQuestion(fen: string): Question {
  const o = Position.fromFen(fen).outcome();
  const answer = o?.kind === 'checkmate' ? 0 : o?.kind === 'stalemate' ? 1 : 2;
  return {
    kind: 'choice',
    prompt: t('Thế cờ này là gì?', 'What is this position?'),
    fen,
    options: OUTCOME_OPTIONS,
    answer,
  };
}

export function knightQuestion(from: Square, to: Square): Question {
  const d = knightDistance(from, to);
  const options = [...new Set([d, Math.max(1, d - 1), d + 1, d + 2])].sort((a, b) => a - b);
  return {
    kind: 'choice',
    prompt: t(
      `Mã cần ít nhất mấy nước để đi từ ${from} tới ${to}?`,
      `Fewest knight moves from ${from} to ${to}?`,
    ),
    fen: placeOn(EMPTY_FEN, from, 'N'),
    options: options.map((n) => t(String(n), String(n))),
    answer: options.indexOf(d),
    highlight: [from, to],
  };
}

export function colorQuestion(square: Square): Question {
  return {
    kind: 'choice',
    prompt: t(`Ô ${square} màu gì?`, `What colour is ${square}?`),
    options: [t('Ô trắng', 'Light square'), t('Ô đen', 'Dark square')],
    answer: isLightSquare(square) ? 0 : 1,
  };
}

/** "Tượng ở `from` có đi tới được ô `to` không?" — dựa vào màu ô. */
export function bishopReachQuestion(from: Square, to: Square): Question {
  return {
    kind: 'choice',
    prompt: t(
      `Tượng ở ${from} có bao giờ tới được ô ${to} không?`,
      `Can the bishop on ${from} ever reach ${to}?`,
    ),
    fen: placeOn(EMPTY_FEN, from, 'B'),
    options: [t('Có', 'Yes'), t('Không bao giờ', 'Never')],
    answer: isLightSquare(from) === isLightSquare(to) ? 0 : 1,
    highlight: [from, to],
  };
}

export function castleQuestion(fen: string, side: 'king' | 'queen'): Question {
  const pos = Position.fromFen(fen);
  const flag = side === 'king' ? MoveFlag.CastleKing : MoveFlag.CastleQueen;
  const can = pos.legalMoves().some((m) => m.flags & flag);
  return {
    kind: 'choice',
    prompt:
      side === 'king'
        ? t('Trắng có nhập thành ngắn (O-O) được không?', 'Can White castle kingside (O-O)?')
        : t('Trắng có nhập thành dài (O-O-O) được không?', 'Can White castle queenside (O-O-O)?'),
    fen,
    options: [t('Được', 'Yes'), t('Không được', 'No')],
    answer: can ? 0 : 1,
  };
}

/** Đặt một quân lên FEN rỗng. */
export function placeOn(fen: string, square: Square, piece: string): string {
  const pos = Position.fromFen(fen);
  const lower = piece.toLowerCase();
  pos.put(square, { color: piece === lower ? 'b' : 'w', type: lower as 'p' });
  return pos.toFen();
}
