import { Position, type Square } from '@duongsinh/chess-core';
import { solveCollect } from './rules';
import type { L10n, MiniGame, Round } from './types';

/** Các loại bài HLV có thể tự tạo từ bàn xếp thế. */
export type CustomMode = 'collect' | 'capture' | 'mate' | 'race' | 'play';

export interface CustomConfig {
  title: string;
  fen: string;
  /** Ô đặt sao (chế độ ăn sao). */
  stars: Square[];
  mode: CustomMode;
  moveLimit: number;
  engineLevel: number;
  avoidAttacked: boolean;
  mustCapture: boolean;
  ordered: boolean;
}

export type BuildResult = { ok: true; def: MiniGame; par?: number } | { ok: false; error: L10n };

const err = (vi: string, en: string): BuildResult => ({ ok: false, error: { vi, en } });

/** Dựng mini-game từ cấu hình của HLV và kiểm tra bài có chơi/giải được không. */
export function buildCustomGame(id: string, cfg: CustomConfig): BuildResult {
  let pos: Position;
  try {
    pos = Position.fromFen(cfg.fen);
  } catch {
    return err('Thế cờ không hợp lệ.', 'Invalid position.');
  }
  const me = pos.side;
  const mine = pos.pieces().filter((p) => (p.piece.color === 'w' ? 0 : 1) === me);
  if (mine.length === 0)
    return err('Bên đến lượt chưa có quân nào.', 'The side to move has no pieces.');
  const title = cfg.title.trim() || 'Bài tự tạo';
  let round: Round;
  let goal: L10n;
  let par: number | undefined;

  if (cfg.mode === 'collect' || cfg.mode === 'capture') {
    const targets =
      cfg.mode === 'collect'
        ? cfg.stars
        : pos
            .pieces()
            .filter((p) => (p.piece.color === 'w' ? 0 : 1) !== me && p.piece.type !== 'k')
            .map((p) => p.square);
    if (targets.length === 0) {
      return cfg.mode === 'collect'
        ? err('Hãy đặt ít nhất 1 ngôi sao (bút ⭐).', 'Place at least one star (⭐ brush).')
        : err('Cần có quân đối phương để bắt.', 'Add opponent pieces to capture.');
    }
    if (targets.length > 12) return err('Tối đa 12 mục tiêu.', 'At most 12 targets.');
    round = {
      mode: 'collect',
      fen: cfg.fen,
      targets,
      ...(cfg.ordered && cfg.mode === 'collect' ? { ordered: true } : {}),
      ...(cfg.avoidAttacked ? { avoidAttacked: true } : {}),
      ...(cfg.mustCapture && cfg.mode === 'capture' ? { mustCapture: true } : {}),
      ...(cfg.moveLimit > 0 ? { moveLimit: cfg.moveLimit } : {}),
    };
    const path = solveCollect(round, Position.fromFen(cfg.fen), 0, 120_000);
    if (!path)
      return err(
        'Bài này không giải được — thử đổi vị trí sao/quân.',
        'This puzzle cannot be solved — move the stars or pieces.',
      );
    if (cfg.moveLimit > 0 && path.length > cfg.moveLimit) {
      return err(
        `Cần ít nhất ${path.length} nước, hãy tăng giới hạn nước.`,
        `Needs at least ${path.length} moves — raise the move limit.`,
      );
    }
    par = path.length;
    goal =
      cfg.mode === 'collect'
        ? {
            vi: `Ăn hết ${targets.length} ngôi sao${cfg.ordered ? ' theo thứ tự' : ''}.`,
            en: `Collect all ${targets.length} stars${cfg.ordered ? ' in order' : ''}.`,
          }
        : {
            vi: `Bắt hết ${targets.length} quân đối phương.`,
            en: `Capture all ${targets.length} enemy pieces.`,
          };
  } else {
    if (cfg.mode !== 'race') {
      const errors = pos.validateStandard();
      if (errors.length)
        return {
          ok: false,
          error: {
            vi: errors.join('; '),
            en: 'Position needs exactly one king per side and no pawns on rank 1/8.',
          },
        };
    }
    if (pos.legalMoves().length === 0)
      return err('Bên đến lượt không còn nước đi.', 'The side to move has no legal moves.');
    const level = Math.min(6, Math.max(1, Math.round(cfg.engineLevel)));
    if (cfg.mode === 'mate') {
      const limit = cfg.moveLimit > 0 ? cfg.moveLimit : 10;
      round = { mode: 'mate', fen: cfg.fen, engineLevel: level, moveLimit: limit };
      goal = { vi: `Chiếu hết trong ${limit} nước.`, en: `Checkmate within ${limit} moves.` };
    } else if (cfg.mode === 'race') {
      if (!mine.some((p) => p.piece.type === 'p'))
        return err('Đua phong cấp cần có Tốt.', 'A promotion race needs pawns.');
      round = { mode: 'race', fen: cfg.fen, engineLevel: level };
      goal = { vi: 'Phong cấp một Tốt trước máy.', en: 'Promote a pawn before the computer.' };
    } else {
      round = { mode: 'play', fen: cfg.fen, engineLevel: level };
      goal = { vi: 'Chiếu hết máy.', en: 'Checkmate the computer.' };
    }
  }

  const def: MiniGame = {
    id,
    level: 'vua',
    order: 0,
    title: { vi: title, en: title },
    story: { vi: 'Bài tập do thầy/cô tự soạn cho em.', en: 'A puzzle made by your coach.' },
    goal,
    lesson: {
      vi: 'Hỏi thầy/cô xem bài này dạy điều gì nhé!',
      en: 'Ask your coach what this lesson teaches!',
    },
    rounds: [round],
    skills: ['custom'],
  };
  return { ok: true, def, ...(par !== undefined ? { par } : {}) };
}

/** Kiểm tra dữ liệu bài tự tạo tải từ máy chủ (không tin tưởng tuyệt đối dữ liệu ngoài). */
export function parseCustomGame(raw: unknown): MiniGame | null {
  if (!raw || typeof raw !== 'object') return null;
  const d = raw as MiniGame;
  if (typeof d.id !== 'string' || !Array.isArray(d.rounds) || d.rounds.length !== 1) return null;
  const r = d.rounds[0]!;
  if (r.mode === 'quiz') return null;
  try {
    Position.fromFen(r.fen);
  } catch {
    return null;
  }
  if (
    r.mode === 'collect' &&
    (!Array.isArray(r.targets) || r.targets.some((t) => !/^[a-h][1-8]$/.test(t)))
  )
    return null;
  return d;
}
