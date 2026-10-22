import {
  ALL_SQUARES,
  type Color,
  findUci,
  Game,
  type Move,
  moveToUci,
  type PieceType,
  Position,
  type Square,
  squareName,
  toSan,
} from '@duongsinh/chess-core';
import { bestMove, chooseMove, createRng } from '@duongsinh/engine';
import { illegalMessage, MUST_CAPTURE_MESSAGE } from './explain';
import {
  applyCollectMove,
  attackedByEnemy,
  countPieces,
  objectiveFor,
  popcount,
  type RaceBaseline,
  raceWinner,
  solveCollect,
} from './rules';
import type { L10n, MiniGame, Question, Round } from './types';

export type SessionStatus = 'playing' | 'round-won' | 'won' | 'lost';

export type SessionEvent =
  | { type: 'move'; uci: string; san: string; by: 'player' | 'engine' }
  | { type: 'collect'; square: Square; remaining: number }
  | { type: 'illegal'; message: L10n | null }
  | { type: 'mistake'; message: L10n }
  | { type: 'correct' }
  | { type: 'trap'; square: Square }
  | { type: 'captured'; square: Square }
  | { type: 'promote'; by: Color }
  | { type: 'round-won' }
  | { type: 'won'; stars: number }
  | { type: 'lost'; reason: L10n };

export interface SessionOptions {
  seed?: number;
  /** Ghi đè cách máy chọn nước (để kiểm thử). */
  think?: (pos: Position, levelId: number, round: Round) => Move | null;
}

const MSG = {
  wrongMove: { vi: 'Chưa đúng rồi, thử lại nhé!', en: 'Not quite — try again!' },
  wrongSquare: { vi: 'Ô này chưa đúng, nhìn kỹ lại nhé!', en: 'Not that square — look again!' },
  trap: { vi: 'Ối! Quân của em bị bắt mất rồi.', en: 'Oops! Your piece was captured.' },
  tooMany: {
    vi: 'Hết lượt đi rồi. Chơi lại để nhanh hơn nhé!',
    en: 'Out of moves. Try again, faster!',
  },
  promoted: { vi: 'Máy đã phong cấp trước.', en: 'The computer promoted first.' },
  lostPawns: { vi: 'Em bị mất hết Tốt rồi.', en: 'You lost all your pawns.' },
  draw: { vi: 'Ván hòa — chưa thắng được, thử lại nhé!', en: "It's a draw — try again!" },
  stalemate: {
    vi: 'Hết nước đi (hòa)! Cẩn thận đừng làm đối phương hết nước.',
    en: 'Stalemate! Be careful not to leave no moves.',
  },
  pieceLost: { vi: 'Em bị mất quân rồi.', en: 'You lost a piece.' },
  checkmated: { vi: 'Em bị chiếu hết rồi.', en: 'You were checkmated.' },
  noCapture: {
    vi: 'Hết quân để ăn rồi — thử thứ tự khác nhé!',
    en: 'Nothing left to capture — try a different order!',
  },
} satisfies Record<string, L10n>;

export interface QuizState {
  question: Question;
  index: number;
  total: number;
  /** Ô cần tìm (find-square). */
  target?: Square;
  selected: Square[];
}

export class MiniGameSession {
  readonly def: MiniGame;
  status: SessionStatus = 'playing';
  roundIndex = 0;
  game!: Game;
  playerColor: Color = 'w';
  /** Bitmask sao đã ăn (collect). */
  mask = 0;
  roundMoves = 0;
  totalMoves = 0;
  enginePlies = 0;
  mistakes = 0;
  hintsUsed = 0;
  undos = 0;
  lostReason?: L10n;
  private puzzleIndex = 0;
  private quizIndex = 0;
  private quizQueue: Array<{ question: Question; target?: Square }> = [];
  private selected: Square[] = [];
  private baseline?: RaceBaseline;
  private readonly rng: () => number;
  private readonly think: NonNullable<SessionOptions['think']>;
  private maskHistory: number[] = [];
  /** Tổng điểm sao chuẩn (par) của các vòng ăn sao. */
  private parTotal = 0;

  constructor(def: MiniGame, opts: SessionOptions = {}) {
    this.def = def;
    this.rng = createRng(opts.seed ?? Date.now());
    this.think =
      opts.think ??
      ((pos, level, round) =>
        chooseMove(pos, level, { rng: this.rng, objective: objectiveFor(round) }));
    this.startRound(0);
  }

  get round(): Round {
    return this.def.rounds[this.roundIndex]!;
  }

  get position(): Position {
    return this.game.position;
  }

  get isPlayerTurn(): boolean {
    return (
      this.status === 'playing' && this.round.mode !== 'quiz' && this.game.turn === this.playerColor
    );
  }

  /** Vòng hiện tại cần máy đi không. */
  get needsEngineMove(): boolean {
    const m = this.round.mode;
    return (
      this.status === 'playing' &&
      m !== 'quiz' &&
      m !== 'collect' &&
      m !== 'puzzle' &&
      this.game.turn !== this.playerColor
    );
  }

  startRound(index: number): void {
    this.roundIndex = index;
    this.status = 'playing';
    this.mask = 0;
    this.maskHistory = [];
    this.collectHistory = [];
    this.roundMoves = 0;
    this.enginePlies = 0;
    this.puzzleIndex = 0;
    this.quizIndex = 0;
    this.selected = [];
    this.lostReason = undefined;
    const r = this.round;
    if (r.mode === 'quiz') {
      this.game = new Game('8/8/8/8/8/8/8/8 w - - 0 1');
      this.quizQueue = [];
      for (const q of r.questions) {
        if (q.kind === 'find-square') {
          const pool = [...ALL_SQUARES];
          for (let i = 0; i < q.count; i++) {
            const pick = pool.splice(Math.floor(this.rng() * pool.length), 1)[0]!;
            this.quizQueue.push({ question: q, target: pick });
          }
        } else this.quizQueue.push({ question: q });
      }
      this.syncQuizBoard();
      return;
    }
    this.game = new Game(r.fen);
    this.playerColor = this.game.turn;
    this.baseline = countPieces(this.game.position);
    if (r.mode === 'collect' && this.parTotal === 0) {
      this.parTotal = this.def.rounds.reduce(
        (sum, x) => sum + (x.mode === 'collect' ? (solveCollect(x)?.length ?? 0) : 0),
        0,
      );
    }
  }

  restartRound(): void {
    this.startRound(this.roundIndex);
  }

  nextRound(): SessionEvent[] {
    if (this.status !== 'round-won') return [];
    if (this.roundIndex + 1 < this.def.rounds.length) {
      this.startRound(this.roundIndex + 1);
      return [];
    }
    return this.finish();
  }

  private finish(): SessionEvent[] {
    this.status = 'won';
    return [{ type: 'won', stars: this.stars() }];
  }

  private winRound(): SessionEvent[] {
    if (this.roundIndex + 1 < this.def.rounds.length) {
      this.status = 'round-won';
      return [{ type: 'round-won' }];
    }
    return this.finish();
  }

  private lose(reason: L10n): SessionEvent[] {
    this.status = 'lost';
    this.lostReason = reason;
    return [{ type: 'lost', reason }];
  }

  // ------------------------------------------------------------ hiển thị

  /** Ô sao còn lại (collect). */
  remainingTargets(): Square[] {
    const r = this.round;
    if (r.mode !== 'collect') return [];
    if (r.ordered) return r.targets.slice(popcount(this.mask));
    return r.targets.filter((_, i) => !(this.mask & (1 << i)));
  }

  /** Ô "bẫy" bị quân địch khống chế. */
  trapSquares(): Square[] {
    const r = this.round;
    if (r.mode !== 'collect' || !r.avoidAttacked) return [];
    return attackedByEnemy(this.position) as Square[];
  }

  quizState(): QuizState | null {
    if (this.round.mode !== 'quiz') return null;
    const item = this.quizQueue[this.quizIndex];
    if (!item) return null;
    return {
      question: item.question,
      index: this.quizIndex,
      total: this.quizQueue.length,
      target: item.target,
      selected: [...this.selected],
    };
  }

  movesLeft(): number | null {
    const r = this.round;
    if (r.mode === 'collect' && r.moveLimit) return r.moveLimit - this.roundMoves;
    if (r.mode === 'mate') return r.moveLimit - this.roundMoves;
    if (r.mode === 'stop') return r.plies - this.enginePlies;
    if (r.mode === 'survive') return r.plies - this.roundMoves;
    return null;
  }

  // ------------------------------------------------------------- người chơi

  playerMove(from: Square, to: Square, promotion?: PieceType): SessionEvent[] {
    if (!this.isPlayerTurn) return [];
    const r = this.round;
    const uci = `${from}${to}${promotion ?? ''}`;
    let m = findUci(this.position, uci);
    if (!m && !promotion) m = findUci(this.position, `${uci}q`);
    if (!m) return [{ type: 'illegal', message: illegalMessage(this.position, from, to) }];
    if (r.mode === 'collect' && r.mustCapture && !m.captured) {
      return [{ type: 'illegal', message: MUST_CAPTURE_MESSAGE }];
    }

    if (r.mode === 'puzzle') return this.puzzleMove(m);

    const events: SessionEvent[] = [];
    this.roundMoves++;
    this.totalMoves++;
    if (r.mode === 'collect') {
      const pos = this.position;
      const fenBefore = this.game.fen;
      const san = toSan(pos, m);
      const step = applyCollectMove(pos, r, this.mask, m);
      this.collectHistory.push({
        fen: fenBefore,
        san,
        from: squareName(m.from),
        to: squareName(m.to),
      });
      this.game = new Game(pos.toFen());
      events.push({ type: 'move', uci: moveToUci(m), san, by: 'player' });
      this.maskHistory.push(this.mask);
      if (step.lost) {
        events.push({ type: 'trap', square: squareName(m.to) });
        return [...events, ...this.lose(MSG.trap)];
      }
      if (step.collected !== undefined) {
        this.mask = step.mask;
        events.push({
          type: 'collect',
          square: squareName(m.to),
          remaining: r.targets.length - popcount(this.mask),
        });
      }
      if (step.done) return [...events, ...this.winRound()];
      if (r.moveLimit && this.roundMoves >= r.moveLimit)
        return [...events, ...this.lose(MSG.tooMany)];
      return events;
    }

    const capturedBefore = this.ownPieceCount();
    const entry = this.game.apply(m);
    events.push({ type: 'move', uci: entry.uci, san: entry.san, by: 'player' });
    return [...events, ...this.judgeAfter('player', capturedBefore)];
  }

  private collectHistory: Array<{ fen: string; san: string; from: Square; to: Square }> = [];

  /** Nước vừa đi (để tô sáng trên bàn). */
  lastMove(): { from: Square; to: Square } | null {
    if (this.round.mode === 'collect') {
      const last = this.collectHistory[this.collectHistory.length - 1];
      return last && this.roundMoves > 0 ? { from: last.from, to: last.to } : null;
    }
    const e = this.game.lastMove;
    return e ? { from: e.from, to: e.to } : null;
  }

  private ownPieceCount(): number {
    return this.position.pieces().filter((p) => p.piece.color === this.playerColor).length;
  }

  private puzzleMove(m: Move): SessionEvent[] {
    const r = this.round;
    if (r.mode !== 'puzzle') return [];
    const expected = r.solution[this.puzzleIndex]!;
    const uci = moveToUci(m);
    const isLast = this.puzzleIndex === r.solution.length - 1;
    let correct = uci === expected;
    if (!correct && isLast && r.anyMate) {
      const pos = this.position;
      pos.make(m);
      correct = pos.inCheck() && pos.legalMoves().length === 0;
      pos.unmake();
    }
    if (!correct) {
      this.mistakes++;
      return [{ type: 'mistake', message: MSG.wrongMove }];
    }
    this.roundMoves++;
    this.totalMoves++;
    const entry = this.game.apply(m);
    const events: SessionEvent[] = [
      { type: 'move', uci, san: entry.san, by: 'player' },
      { type: 'correct' },
    ];
    this.puzzleIndex++;
    if (this.puzzleIndex >= r.solution.length) return [...events, ...this.winRound()];
    return events;
  }

  /** Nước trả lời tự động của đối phương trong bài tập. */
  puzzleReply(): SessionEvent[] {
    const r = this.round;
    if (r.mode !== 'puzzle' || this.status !== 'playing' || this.game.turn === this.playerColor)
      return [];
    const uci = r.solution[this.puzzleIndex];
    if (!uci) return [];
    const entry = this.game.move(uci);
    if (!entry) throw new Error(`Lời giải sai ở ${this.def.id}: ${uci}`);
    this.puzzleIndex++;
    return [{ type: 'move', uci, san: entry.san, by: 'engine' }];
  }

  /** Máy đi một nước (đồng bộ). */
  engineMove(): SessionEvent[] {
    if (!this.needsEngineMove) {
      return this.round.mode === 'puzzle' ? this.puzzleReply() : [];
    }
    const r = this.round;
    const level = 'engineLevel' in r ? r.engineLevel : 1;
    const capturedBefore = this.ownPieceCount();
    const m = this.think(this.position.clone(), level, r);
    if (!m) return this.judgeAfter('engine', capturedBefore);
    const entry = this.game.apply(m);
    this.enginePlies++;
    return [
      { type: 'move', uci: entry.uci, san: entry.san, by: 'engine' },
      ...this.judgeAfter('engine', capturedBefore),
    ];
  }

  private judgeAfter(by: 'player' | 'engine', ownBefore: number): SessionEvent[] {
    const r = this.round;
    const pos = this.position;
    const me = this.playerColor;
    const events: SessionEvent[] = [];
    switch (r.mode) {
      case 'race':
      case 'stop': {
        const w = raceWinner(pos, this.baseline!);
        const promoted = countPieces(pos).officers;
        if (w === me) {
          if (promoted[me === 'w' ? 0 : 1] > this.baseline!.officers[me === 'w' ? 0 : 1]) {
            events.push({ type: 'promote', by: me });
          }
          return [...events, ...this.winRound()];
        }
        if (w === 'draw') return this.lose(MSG.draw);
        if (w) {
          const enemyPromoted =
            promoted[me === 'w' ? 1 : 0] > this.baseline!.officers[me === 'w' ? 1 : 0];
          return this.lose(enemyPromoted ? MSG.promoted : MSG.lostPawns);
        }
        if (r.mode === 'stop' && by === 'engine' && this.enginePlies >= r.plies)
          return this.winRound();
        return events;
      }
      case 'survive': {
        if (by === 'engine' && this.ownPieceCount() < ownBefore) {
          const last = this.game.lastMove!;
          return [{ type: 'captured', square: last.to }, ...this.lose(MSG.pieceLost)];
        }
        if (by === 'engine' && this.roundMoves >= r.plies) return this.winRound();
        return events;
      }
      case 'mate':
      case 'play': {
        const o = pos.outcome();
        if (o?.kind === 'checkmate')
          return o.winner === me ? this.winRound() : this.lose(MSG.checkmated);
        if (o?.kind === 'stalemate') return this.lose(MSG.stalemate);
        if (o) return this.lose(MSG.draw);
        if (r.mode === 'mate') {
          if (by === 'engine' && this.ownPieceCount() < ownBefore && this.cannotMateAnymore()) {
            return this.lose(MSG.pieceLost);
          }
          if (by === 'player' && this.roundMoves >= r.moveLimit) return this.lose(MSG.tooMany);
        }
        return events;
      }
      default:
        return events;
    }
  }

  private cannotMateAnymore(): boolean {
    const mine = this.position.pieces().filter((p) => p.piece.color === this.playerColor);
    return mine.every((p) => p.piece.type === 'k');
  }

  // ------------------------------------------------------------------ quiz

  private syncQuizBoard(): void {
    const item = this.quizQueue[this.quizIndex];
    const fen = item && item.question.kind !== 'find-square' ? item.question.fen : undefined;
    this.game = new Game(fen ?? '8/8/8/8/8/8/8/8 w - - 0 1');
    this.playerColor = 'w';
  }

  /** Chạm một ô trong câu hỏi trắc nghiệm ô cờ. */
  tapSquare(square: Square): SessionEvent[] {
    const item = this.quizQueue[this.quizIndex];
    if (this.status !== 'playing' || !item) return [];
    const q = item.question;
    if (q.kind === 'find-square') {
      if (square === item.target) return this.nextQuestion();
      this.mistakes++;
      return [{ type: 'mistake', message: MSG.wrongSquare }];
    }
    if (q.kind === 'squares') {
      if (this.selected.includes(square)) {
        this.selected = this.selected.filter((s) => s !== square);
        return [];
      }
      if (!q.answer.includes(square)) {
        this.mistakes++;
        return [{ type: 'mistake', message: MSG.wrongSquare }];
      }
      this.selected.push(square);
      if (q.answer.every((s) => this.selected.includes(s))) return this.nextQuestion();
      return [{ type: 'correct' }];
    }
    return [];
  }

  answerChoice(index: number): SessionEvent[] {
    const item = this.quizQueue[this.quizIndex];
    if (this.status !== 'playing' || !item || item.question.kind !== 'choice') return [];
    if (index === item.question.answer) return this.nextQuestion();
    this.mistakes++;
    return [{ type: 'mistake', message: MSG.wrongMove }];
  }

  private nextQuestion(): SessionEvent[] {
    this.quizIndex++;
    this.selected = [];
    if (this.quizIndex >= this.quizQueue.length) return [{ type: 'correct' }, ...this.winRound()];
    this.syncQuizBoard();
    return [{ type: 'correct' }];
  }

  // ------------------------------------------------------------ hỗ trợ

  /** Gợi ý nước tiếp theo (UCI) hoặc ô cần chạm. */
  hint(): string | null {
    if (this.status !== 'playing') return null;
    const r = this.round;
    this.hintsUsed++;
    if (r.mode === 'quiz') {
      const item = this.quizQueue[this.quizIndex];
      if (!item) return null;
      if (item.target) return item.target;
      if (item.question.kind === 'squares') {
        return item.question.answer.find((s) => !this.selected.includes(s)) ?? null;
      }
      return null;
    }
    if (r.mode === 'puzzle') return r.solution[this.puzzleIndex] ?? null;
    if (r.mode === 'collect') return solveCollect(r, this.position, this.mask)?.[0] ?? null;
    const best = bestMove(this.position, { timeMs: 700, objective: objectiveFor(r) }).move;
    return best ? moveToUci(best) : null;
  }

  /** Đi lại nước vừa rồi (cả nước của máy nếu có). */
  undo(): boolean {
    const r = this.round;
    if (r.mode === 'quiz' || r.mode === 'puzzle' || this.status === 'won') return false;
    if (r.mode === 'collect') {
      const last = this.collectHistory.pop();
      if (!last || this.roundMoves === 0) return false;
      this.game = new Game(last.fen);
      this.mask = this.maskHistory.pop() ?? 0;
      this.roundMoves--;
      this.status = 'playing';
      this.undos++;
      return true;
    }
    if (this.game.history.length === 0) return false;
    if (this.game.turn === this.playerColor && this.game.history.length >= 2) {
      this.game.undo();
      this.enginePlies = Math.max(0, this.enginePlies - 1);
    }
    this.game.undo();
    this.roundMoves = Math.max(0, this.roundMoves - 1);
    this.status = 'playing';
    this.lostReason = undefined;
    this.undos++;
    return true;
  }

  /** Số sao (1–3) khi thắng. */
  stars(): number {
    const hasCollect = this.def.rounds.some((x) => x.mode === 'collect');
    const help = this.hintsUsed + this.undos;
    if (hasCollect && this.parTotal > 0) {
      const extra = this.totalMoves - this.parTotal;
      const base = extra <= 0 ? 3 : extra <= 2 ? 2 : 1;
      return Math.max(1, base - Math.min(1, help));
    }
    const penalty = this.mistakes + help;
    return penalty === 0 ? 3 : penalty <= 2 ? 2 : 1;
  }
}

export function parFor(def: MiniGame): number {
  return def.rounds.reduce(
    (sum, r) => sum + (r.mode === 'collect' ? (solveCollect(r)?.length ?? 0) : 0),
    0,
  );
}

/** Thế cờ ban đầu (dùng cho ảnh thu nhỏ). */
export function previewFen(def: MiniGame): string {
  const r = def.rounds[0]!;
  if (r.mode === 'quiz') {
    const q = r.questions.find((x) => x.kind !== 'find-square');
    return (q && 'fen' in q && q.fen) || '8/8/8/8/8/8/8/8 w - - 0 1';
  }
  return r.fen;
}

export { Position };
