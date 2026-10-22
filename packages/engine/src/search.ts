import type { Move, Position } from '@duongsinh/chess-core';
import { evaluateWhite, PIECE_VALUE } from './evaluate';

export const MATE = 100_000;
export const INF = 1_000_000;

/** Mục tiêu riêng của mini-game, cộng/thay thế cho đánh giá chuẩn. */
export interface Objective {
  /** Điểm cộng thêm theo góc nhìn Trắng. */
  evaluate?(pos: Position): number;
  /**
   * Thế kết thúc theo luật mini-game: trả về điểm theo góc nhìn bên ĐẾN LƯỢT
   * (âm = bên đến lượt đã thua), hoặc null nếu chưa kết thúc.
   */
  terminal?(pos: Position): number | null;
  /** Bỏ đánh giá vật chất/vị trí chuẩn, chỉ dùng `evaluate`. */
  replaceEval?: boolean;
}

export interface SearchLimits {
  depth: number;
  /** Mốc thời gian (Date.now()) phải dừng. */
  deadline?: number;
  quiescence?: boolean;
  objective?: Objective;
}

interface TTEntry {
  depth: number;
  score: number;
  flag: 0 | 1 | 2; // 0 chính xác, 1 cận dưới, 2 cận trên
  best?: Move;
}

const sameMove = (a: Move | undefined, b: Move) =>
  !!a && a.from === b.from && a.to === b.to && a.promotion === b.promotion;

export class Searcher {
  nodes = 0;
  stopped = false;
  private readonly tt = new Map<number, TTEntry>();
  private readonly killers: Array<[Move?, Move?]> = [];
  private readonly history = new Int32Array(16 * 128);

  constructor(
    private readonly pos: Position,
    private limits: SearchLimits,
  ) {}

  setLimits(limits: SearchLimits) {
    this.limits = limits;
    this.stopped = false;
  }

  evaluate(): number {
    const o = this.limits.objective;
    let white = o?.replaceEval ? 0 : evaluateWhite(this.pos);
    if (o?.evaluate) white += o.evaluate(this.pos);
    return this.pos.side === 0 ? white : -white;
  }

  private checkTime() {
    if ((this.nodes & 1023) === 0 && this.limits.deadline && Date.now() > this.limits.deadline) {
      this.stopped = true;
    }
  }

  private order(moves: Move[], ply: number, ttMove?: Move): Move[] {
    const killers = this.killers[ply];
    const scored = moves.map((m) => {
      let s = 0;
      if (sameMove(ttMove, m)) s = 10_000_000;
      else if (m.captured)
        s = 1_000_000 + PIECE_VALUE[m.captured & 7]! * 10 - PIECE_VALUE[m.piece & 7]!;
      else if (m.promotion) s = 900_000;
      else if (killers && (sameMove(killers[0], m) || sameMove(killers[1], m))) s = 800_000;
      else s = this.history[m.piece * 128 + m.to]!;
      return { m, s };
    });
    scored.sort((a, b) => b.s - a.s);
    return scored.map((x) => x.m);
  }

  private terminalScore(ply: number): number | null {
    const t = this.limits.objective?.terminal?.(this.pos);
    if (t === null || t === undefined) return null;
    // Thắng/thua sớm hơn tốt hơn.
    return t > 0 ? t - ply : t < 0 ? t + ply : 0;
  }

  quiesce(alpha: number, beta: number, ply: number, qdepth: number): number {
    this.nodes++;
    this.checkTime();
    const term = this.terminalScore(ply);
    if (term !== null) return term;
    const standPat = this.evaluate();
    if (standPat >= beta) return standPat;
    if (standPat > alpha) alpha = standPat;
    if (qdepth <= 0 || this.stopped) return standPat;
    const moves = this.order(this.pos.legalMoves(true), ply);
    for (const m of moves) {
      this.pos.make(m);
      const score = -this.quiesce(-beta, -alpha, ply + 1, qdepth - 1);
      this.pos.unmake();
      if (this.stopped) return alpha;
      if (score >= beta) return score;
      if (score > alpha) alpha = score;
    }
    return alpha;
  }

  negamax(depth: number, alpha: number, beta: number, ply: number): number {
    this.nodes++;
    this.checkTime();
    if (this.stopped) return 0;
    const pos = this.pos;
    const term = this.terminalScore(ply);
    if (term !== null) return term;
    if (ply > 0 && (pos.halfmove >= 100 || pos.repetitions() >= 2)) return 0;

    const inCheck = pos.inCheck();
    if (inCheck && depth < 1) depth = 1; // mở rộng khi bị chiếu
    if (depth <= 0) {
      return this.limits.quiescence === false ? this.evaluate() : this.quiesce(alpha, beta, ply, 8);
    }

    const key = pos.key();
    const entry = this.tt.get(key);
    if (entry && entry.depth >= depth && ply > 0) {
      if (entry.flag === 0) return entry.score;
      if (entry.flag === 1 && entry.score >= beta) return entry.score;
      if (entry.flag === 2 && entry.score <= alpha) return entry.score;
    }

    const moves = pos.legalMoves();
    if (moves.length === 0) {
      if (inCheck) return -MATE + ply;
      // Thế không Vua hết nước: dùng đánh giá (mini-game), thế chuẩn: hòa.
      return pos.kings[pos.side] === -1 ? this.evaluate() : 0;
    }

    const alphaOrig = alpha;
    let best = -INF;
    let bestMove: Move | undefined;
    for (const m of this.order(moves, ply, entry?.best)) {
      pos.make(m);
      const score = -this.negamax(depth - 1, -beta, -alpha, ply + 1);
      pos.unmake();
      if (this.stopped) return best === -INF ? 0 : best;
      if (score > best) {
        best = score;
        bestMove = m;
      }
      if (score > alpha) alpha = score;
      if (alpha >= beta) {
        if (!m.captured) {
          if (!this.killers[ply]) this.killers[ply] = [undefined, undefined];
          const k = this.killers[ply]!;
          if (!sameMove(k[0], m)) {
            k[1] = k[0];
            k[0] = m;
          }
          this.history[m.piece * 128 + m.to]! += depth * depth;
        }
        break;
      }
    }
    this.tt.set(key, {
      depth,
      score: best,
      flag: best <= alphaOrig ? 2 : best >= beta ? 1 : 0,
      best: bestMove,
    });
    if (this.tt.size > 400_000) this.tt.clear();
    return best;
  }

  /** Chấm điểm từng nước ở gốc (cửa sổ đầy đủ) — dùng để máy chọn nước "kiểu trẻ em". */
  scoreRootMoves(depth: number): Array<{ move: Move; score: number }> {
    const out: Array<{ move: Move; score: number }> = [];
    for (const m of this.order(this.pos.legalMoves(), 0)) {
      this.pos.make(m);
      const score = -this.negamax(depth - 1, -INF, INF, 1);
      this.pos.unmake();
      if (this.stopped && out.length > 0) break;
      out.push({ move: m, score });
    }
    out.sort((a, b) => b.score - a.score);
    return out;
  }

  /** Một vòng tìm kiếm ở độ sâu cố định, trả về nước tốt nhất. */
  searchRoot(depth: number, prevBest?: Move): { move?: Move; score: number } {
    let alpha = -INF;
    const beta = INF;
    let bestMove: Move | undefined;
    let best = -INF;
    for (const m of this.order(this.pos.legalMoves(), 0, prevBest)) {
      this.pos.make(m);
      const score = -this.negamax(depth - 1, -beta, -alpha, 1);
      this.pos.unmake();
      if (this.stopped) break;
      if (score > best) {
        best = score;
        bestMove = m;
      }
      if (score > alpha) alpha = score;
    }
    return { move: bestMove, score: best };
  }
}
