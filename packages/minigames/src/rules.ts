import { type Color, type Move, Position, squareIndex, squareName } from '@duongsinh/chess-core';
import type { Objective } from '@duongsinh/engine';
import type { CollectRound, Round } from './types';

const WIN = 50_000;

/** Đếm quân theo màu: số Tốt và số quân "đã phong cấp" (không phải Tốt/Vua). */
export function countPieces(pos: Position): {
  pawns: [number, number];
  officers: [number, number];
} {
  const pawns: [number, number] = [0, 0];
  const officers: [number, number] = [0, 0];
  for (let i = 0; i < 128; i++) {
    if (i & 0x88) continue;
    const c = pos.board[i]!;
    if (!c) continue;
    const side = c & 8 ? 1 : 0;
    const t = c & 7;
    if (t === 1) pawns[side]++;
    else if (t !== 6) officers[side]++;
  }
  return { pawns, officers };
}

export interface RaceBaseline {
  pawns: [number, number];
  officers: [number, number];
}

/**
 * Người thắng theo luật đua Tốt (null nếu chưa phân thắng bại):
 * phong cấp trước thắng; bên nào mất hết Tốt thì thua; kẹt nước thì bên nhiều Tốt hơn thắng.
 */
export function raceWinner(pos: Position, base: RaceBaseline): Color | 'draw' | null {
  const now = countPieces(pos);
  if (now.officers[0] > base.officers[0]) return 'w';
  if (now.officers[1] > base.officers[1]) return 'b';
  if (base.pawns[0] > 0 && now.pawns[0] === 0) return 'b';
  if (base.pawns[1] > 0 && now.pawns[1] === 0) return 'w';
  if (pos.legalMoves().length === 0) {
    if (pos.inCheck()) return pos.turn === 'w' ? 'b' : 'w';
    if (pos.kings[0] === -1 && pos.kings[1] === -1) {
      if (now.pawns[0] > now.pawns[1]) return 'w';
      if (now.pawns[1] > now.pawns[0]) return 'b';
    }
    return 'draw';
  }
  return null;
}

/** Thưởng điểm cho Tốt tiến lên, tăng nhanh khi gần phong cấp (góc nhìn Trắng). */
export function pawnAdvance(pos: Position, weight = 7): number {
  let s = 0;
  for (let i = 0; i < 128; i++) {
    if (i & 0x88) continue;
    const c = pos.board[i]!;
    if ((c & 7) !== 1) continue;
    const rank = i >> 4;
    if (c & 8) s -= (6 - rank) * (6 - rank) * weight;
    else s += (rank - 1) * (rank - 1) * weight;
  }
  return s;
}

/** Mục tiêu cho máy theo từng chế độ chơi. */
export function objectiveFor(round: Round): Objective | undefined {
  if (round.mode === 'race' || round.mode === 'stop') {
    const base = countPieces(Position.fromFen(round.fen));
    return {
      evaluate: (p) => pawnAdvance(p),
      terminal: (p) => {
        const w = raceWinner(p, base);
        if (w === null) return null;
        if (w === 'draw') return 0;
        return w === p.turn ? WIN : -WIN;
      },
    };
  }
  if (round.mode === 'survive') {
    const start = Position.fromFen(round.fen);
    const player = start.side;
    const count = (p: Position) => {
      let n = 0;
      for (let i = 0; i < 128; i++) {
        if (i & 0x88) continue;
        const c = p.board[i]!;
        if (c && (c & 8 ? 1 : 0) === player) n++;
      }
      return n;
    };
    const initial = count(start);
    return {
      // Mất quân là thua ngay theo luật "sống sót".
      terminal: (p) => (count(p) < initial ? (p.side === player ? -WIN : WIN) : null),
    };
  }
  return undefined;
}

export function sideIndex(c: Color): number {
  return c === 'w' ? 0 : 1;
}

// ------------------------------------------------------------------ ăn sao

export interface CollectStep {
  ok: boolean;
  lost?: boolean;
  collected?: number;
  done: boolean;
  mask: number;
}

/**
 * Áp dụng một nước trong chế độ ăn sao. Nếu chưa xong, đối phương "bỏ lượt".
 * Trả về trạng thái mới; nếu `lost` hoặc `done` thì đối phương không bỏ lượt.
 */
export function applyCollectMove(
  pos: Position,
  round: CollectRound,
  mask: number,
  move: Move,
): CollectStep {
  const enemy = 1 - pos.side;
  pos.make(move);
  if (round.avoidAttacked && pos.isAttacked(move.to, enemy)) {
    return { ok: true, lost: true, done: false, mask };
  }
  const to = squareName(move.to);
  let collected: number | undefined;
  if (round.ordered) {
    const next = popcount(mask);
    if (round.targets[next] === to) collected = next;
  } else {
    const idx = round.targets.indexOf(to);
    if (idx !== -1 && !(mask & (1 << idx))) collected = idx;
  }
  const newMask = collected === undefined ? mask : mask | (1 << collected);
  const done = newMask === (1 << round.targets.length) - 1;
  if (!done) pos.makeNull();
  return { ok: true, collected, done, mask: newMask };
}

export function undoCollectMove(pos: Position, step: CollectStep): void {
  if (!step.done && !step.lost) pos.unmakeNull();
  pos.unmake();
}

export function popcount(n: number): number {
  let c = 0;
  let x = n;
  while (x) {
    x &= x - 1;
    c++;
  }
  return c;
}

/** Các ô bị quân địch khống chế (để hiển thị "bẫy"). */
export function attackedByEnemy(pos: Position): string[] {
  const enemy = 1 - pos.side;
  const out: string[] = [];
  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const i = r * 16 + f;
      if (pos.isAttacked(i, enemy)) out.push(squareName(i));
    }
  }
  return out;
}

/**
 * Giải bài ăn sao bằng BFS: trả về chuỗi nước ngắn nhất (UCI), hoặc null nếu không giải được.
 * `startMask` cho phép giải tiếp từ giữa chừng (dùng để gợi ý).
 */
export function solveCollect(
  round: CollectRound,
  start: Position = Position.fromFen(round.fen),
  startMask = 0,
  maxStates = 300_000,
): string[] | null {
  interface Node {
    fen: string;
    mask: number;
    path: string[];
  }
  const full = (1 << round.targets.length) - 1;
  if (startMask === full) return [];
  const seen = new Set<string>();
  const startNode: Node = { fen: start.toFen(), mask: startMask, path: [] };
  let frontier: Node[] = [startNode];
  seen.add(`${boardKey(startNode.fen)}|${startMask}`);
  while (frontier.length) {
    const next: Node[] = [];
    for (const node of frontier) {
      const pos = Position.fromFen(node.fen);
      for (const m of pos.legalMoves()) {
        if (m.promotion && m.promotion !== 'q') continue;
        const step = applyCollectMove(pos, round, node.mask, m);
        const uci = `${squareName(m.from)}${squareName(m.to)}${m.promotion ?? ''}`;
        if (!step.lost) {
          if (step.done) return [...node.path, uci];
          const fen = pos.toFen();
          const key = `${boardKey(fen)}|${step.mask}`;
          if (!seen.has(key)) {
            seen.add(key);
            next.push({ fen, mask: step.mask, path: [...node.path, uci] });
          }
        }
        undoCollectMove(pos, step);
      }
      if (seen.size > maxStates) return null;
    }
    frontier = next;
  }
  return null;
}

/** Bỏ đồng hồ nước khỏi FEN để so sánh trạng thái. */
function boardKey(fen: string): string {
  return fen.split(' ').slice(0, 4).join(' ');
}

/** Số nước Mã ít nhất giữa hai ô. */
export function knightDistance(from: string, to: string): number {
  const start = squareIndex(from);
  const goal = squareIndex(to);
  const dist = new Map<number, number>([[start, 0]]);
  const queue = [start];
  while (queue.length) {
    const s = queue.shift()!;
    if (s === goal) return dist.get(s)!;
    for (const o of [-33, -31, -18, -14, 14, 18, 31, 33]) {
      const t = s + o;
      if (t & 0x88 || dist.has(t)) continue;
      dist.set(t, dist.get(s)! + 1);
      queue.push(t);
    }
  }
  return -1;
}
