import { toPgn } from './pgn';
import { Position, START_FEN } from './position';
import { findUci, moveToUci, toSan } from './san';
import { squareIndex, squareName, typeOfCode } from './squares';
import type { Move, Outcome, PieceType, Square } from './types';

export interface HistoryEntry {
  san: string;
  uci: string;
  from: Square;
  to: Square;
  fenBefore: string;
  fenAfter: string;
  captured: PieceType | null;
}

/** Ván cờ cấp cao cho giao diện: lưu lịch sử, đi lại, xuất PGN. */
export class Game {
  readonly startFen: string;
  private pos: Position;
  private readonly entries: HistoryEntry[] = [];

  constructor(fen: string = START_FEN) {
    this.startFen = fen;
    this.pos = Position.fromFen(fen);
  }

  get position(): Position {
    return this.pos;
  }

  get fen(): string {
    return this.pos.toFen();
  }

  get turn() {
    return this.pos.turn;
  }

  get history(): readonly HistoryEntry[] {
    return this.entries;
  }

  get lastMove(): HistoryEntry | undefined {
    return this.entries[this.entries.length - 1];
  }

  legalMoves(): Move[] {
    return this.pos.legalMoves();
  }

  /** Các ô có thể đi tới từ `from`. */
  targets(from: Square): Square[] {
    const i = squareIndex(from);
    return [
      ...new Set(
        this.pos
          .legalMoves()
          .filter((m) => m.from === i)
          .map((m) => squareName(m.to)),
      ),
    ];
  }

  /** Nước từ from→to có phải phong cấp không (để hiện bảng chọn quân). */
  isPromotion(from: Square, to: Square): boolean {
    const f = squareIndex(from);
    const t = squareIndex(to);
    return this.pos.legalMoves().some((m) => m.from === f && m.to === t && m.promotion);
  }

  /** Đi một nước; trả về mục lịch sử hoặc null nếu nước không hợp lệ. */
  move(input: string | { from: Square; to: Square; promotion?: PieceType }): HistoryEntry | null {
    const uci =
      typeof input === 'string' ? input : `${input.from}${input.to}${input.promotion ?? ''}`;
    let m = findUci(this.pos, uci);
    if (!m && typeof input !== 'string' && !input.promotion) {
      m = findUci(this.pos, `${uci}q`);
    }
    if (!m) return null;
    return this.apply(m);
  }

  apply(m: Move): HistoryEntry {
    const fenBefore = this.pos.toFen();
    const san = toSan(this.pos, m);
    this.pos.make(m);
    const entry: HistoryEntry = {
      san,
      uci: moveToUci(m),
      from: squareName(m.from),
      to: squareName(m.to),
      fenBefore,
      fenAfter: this.pos.toFen(),
      captured: m.captured ? typeOfCode(m.captured) : null,
    };
    this.entries.push(entry);
    return entry;
  }

  undo(): HistoryEntry | undefined {
    const e = this.entries.pop();
    if (e) this.pos.unmake();
    return e;
  }

  outcome(): Outcome | null {
    return this.pos.outcome();
  }

  inCheck(): boolean {
    return this.pos.inCheck();
  }

  pgn(tags?: Record<string, string>, result?: string): string {
    return toPgn({
      tags,
      startFen: this.startFen,
      sans: this.entries.map((e) => e.san),
      result: result ?? resultString(this.outcome()),
    });
  }
}

export function resultString(o: Outcome | null): string {
  if (!o) return '*';
  if (o.kind === 'checkmate') return o.winner === 'w' ? '1-0' : '0-1';
  return '1/2-1/2';
}
