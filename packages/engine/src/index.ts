import type { Move, Position } from '@duongsinh/chess-core';
import { MATE, type Objective, Searcher } from './search';

export { evaluateWhite, PIECE_VALUE } from './evaluate';
export { INF, MATE, type Objective, Searcher } from './search';

export type LevelKey = 'tot' | 'ma' | 'tuong' | 'xe' | 'hau' | 'vua';

export interface EngineLevel {
  id: 1 | 2 | 3 | 4 | 5 | 6;
  key: LevelKey;
  name: { vi: string; en: string };
  depth: number;
  quiescence: boolean;
  /** Xác suất cố tình đi nước kém. */
  blunder: number;
  /** Khi đi nước kém: chỉ chọn trong các nước kém hơn nước tốt nhất tối đa bấy nhiêu centipawn. */
  margin: number;
  topK: number;
  /** Nhiệt độ softmax (centipawn); 0 = luôn chọn nước tốt nhất. */
  temperature: number;
  timeMs: number;
}

/** 6 cấp máy, đặt theo lộ trình Dương Sinh: Tốt → Mã → Tượng → Xe → Hậu → Vua. */
export const LEVELS: readonly EngineLevel[] = [
  {
    id: 1,
    key: 'tot',
    name: { vi: 'Máy Tốt', en: 'Pawn Bot' },
    depth: 1,
    quiescence: false,
    blunder: 0.45,
    margin: Number.POSITIVE_INFINITY,
    topK: 6,
    temperature: 250,
    timeMs: 400,
  },
  {
    id: 2,
    key: 'ma',
    name: { vi: 'Máy Mã', en: 'Knight Bot' },
    depth: 1,
    quiescence: true,
    blunder: 0.25,
    margin: 900,
    topK: 4,
    temperature: 120,
    timeMs: 500,
  },
  {
    id: 3,
    key: 'tuong',
    name: { vi: 'Máy Tượng', en: 'Bishop Bot' },
    depth: 2,
    quiescence: true,
    blunder: 0.15,
    margin: 500,
    topK: 3,
    temperature: 60,
    timeMs: 700,
  },
  {
    id: 4,
    key: 'xe',
    name: { vi: 'Máy Xe', en: 'Rook Bot' },
    depth: 2,
    quiescence: true,
    blunder: 0.08,
    margin: 300,
    topK: 3,
    temperature: 30,
    timeMs: 900,
  },
  {
    id: 5,
    key: 'hau',
    name: { vi: 'Máy Hậu', en: 'Queen Bot' },
    depth: 3,
    quiescence: true,
    blunder: 0.03,
    margin: 150,
    topK: 2,
    temperature: 12,
    timeMs: 1200,
  },
  {
    id: 6,
    key: 'vua',
    name: { vi: 'Máy Vua', en: 'King Bot' },
    depth: 6,
    quiescence: true,
    blunder: 0,
    margin: 0,
    topK: 1,
    temperature: 0,
    timeMs: 1500,
  },
];

export function getLevel(id: number): EngineLevel {
  return LEVELS[Math.min(Math.max(Math.round(id), 1), 6) - 1]!;
}

/** RNG có hạt giống (mulberry32) — để kiểm thử tái lập được. */
export function createRng(seed = Date.now()): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface ThinkOptions {
  rng?: () => number;
  objective?: Objective;
  /** Ghi đè thời gian suy nghĩ. */
  timeMs?: number;
}

export interface BestResult {
  move: Move | null;
  score: number;
  depth: number;
  nodes: number;
}

/** Tìm nước mạnh nhất bằng iterative deepening (dùng cho gợi ý và Máy Vua). */
export function bestMove(
  pos: Position,
  opts: { depth?: number; timeMs?: number; objective?: Objective } = {},
): BestResult {
  const work = pos.clone();
  const maxDepth = opts.depth ?? 64;
  const deadline = Date.now() + (opts.timeMs ?? 1000);
  const s = new Searcher(work, { depth: 1, deadline, objective: opts.objective });
  const legal = work.legalMoves();
  if (legal.length === 0) return { move: null, score: 0, depth: 0, nodes: 0 };
  let result: BestResult = { move: legal[0]!, score: 0, depth: 0, nodes: 0 };
  for (let d = 1; d <= maxDepth; d++) {
    s.setLimits({ depth: d, deadline, objective: opts.objective, quiescence: true });
    const r = s.searchRoot(d, result.move ?? undefined);
    if (s.stopped && d > 1) break;
    if (r.move) result = { move: r.move, score: r.score, depth: d, nodes: s.nodes };
    if (Math.abs(r.score) > MATE - 1000) break; // đã thấy chiếu hết
    if (Date.now() > deadline) break;
  }
  result.nodes = s.nodes;
  return result;
}

/** Máy chọn nước theo cấp độ — cấp thấp cố tình đi "giống trẻ con". */
export function chooseMove(pos: Position, levelId: number, opts: ThinkOptions = {}): Move | null {
  const level = getLevel(levelId);
  const rng = opts.rng ?? Math.random;
  const legal = pos.legalMoves();
  if (legal.length === 0) return null;
  if (legal.length === 1) return legal[0]!;
  const timeMs = opts.timeMs ?? level.timeMs;
  if (level.id === 6) {
    return bestMove(pos, { depth: level.depth, timeMs, objective: opts.objective }).move;
  }
  const work = pos.clone();
  const s = new Searcher(work, {
    depth: level.depth,
    deadline: Date.now() + timeMs,
    quiescence: level.quiescence,
    objective: opts.objective,
  });
  const scored = s.scoreRootMoves(level.depth);
  const best = scored[0]!;
  // Cấp từ Tượng trở lên: không bỏ lỡ nước chiếu hết ngay.
  if (level.id >= 3 && best.score > MATE - 1000) return best.move;
  if (rng() < level.blunder) {
    const pool = scored.filter((x, i) => i > 0 && x.score >= best.score - level.margin);
    if (pool.length) return pool[Math.floor(rng() * pool.length)]!.move;
  }
  const top = scored.slice(0, Math.max(1, level.topK));
  if (level.temperature <= 0 || top.length === 1) return best.move;
  const weights = top.map((x) => Math.exp((x.score - best.score) / level.temperature));
  const total = weights.reduce((a, b) => a + b, 0);
  let r = rng() * total;
  for (let i = 0; i < top.length; i++) {
    r -= weights[i]!;
    if (r <= 0) return top[i]!.move;
  }
  return best.move;
}

/** Gợi ý nước tốt cho trẻ. */
export function hint(pos: Position, objective?: Objective): Move | null {
  return bestMove(pos, { timeMs: 600, objective }).move;
}

const nextTick = () => new Promise<void>((r) => setTimeout(r, 0));

/**
 * Phiên bản bất đồng bộ cho giao diện: nhường luồng trước khi nghĩ và
 * giữ thời gian chờ tối thiểu để nước đi của máy trông "tự nhiên".
 */
export async function thinkAsync(
  pos: Position,
  levelId: number,
  opts: ThinkOptions & { minDelayMs?: number } = {},
): Promise<Move | null> {
  const started = Date.now();
  await nextTick();
  const move = chooseMove(pos, levelId, opts);
  const wait = (opts.minDelayMs ?? 350) - (Date.now() - started);
  if (wait > 0) await new Promise<void>((r) => setTimeout(r, wait));
  return move;
}
