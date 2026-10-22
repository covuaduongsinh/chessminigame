import {
  BISHOP,
  BLACK,
  codeToPiece,
  colorOfCode,
  fileOf,
  KING,
  KNIGHT,
  PAWN,
  pieceCode,
  QUEEN,
  ROOK,
  rankOf,
  squareIndex,
  squareName,
  typeIndex,
  typeOfCode,
} from './squares';
import {
  type Color,
  type Move,
  MoveFlag,
  type Outcome,
  type Piece,
  type PieceType,
  type Square,
} from './types';

export const START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

const KNIGHT_OFFSETS = [-33, -31, -18, -14, 14, 18, 31, 33];
const BISHOP_OFFSETS = [-17, -15, 15, 17];
const ROOK_OFFSETS = [-16, -1, 1, 16];
const KING_OFFSETS = [-17, -16, -15, -1, 1, 15, 16, 17];

const CASTLE_WK = 1;
const CASTLE_WQ = 2;
const CASTLE_BK = 4;
const CASTLE_BQ = 8;

const A1 = 0;
const E1 = 4;
const H1 = 7;
const A8 = 112;
const E8 = 116;
const H8 = 119;

/** Mặt nạ quyền nhập thành: quân rời/đến ô này thì mất quyền tương ứng. */
const CASTLE_MASK = new Uint8Array(128).fill(15);
CASTLE_MASK[A1] = 15 & ~CASTLE_WQ;
CASTLE_MASK[E1] = 15 & ~(CASTLE_WK | CASTLE_WQ);
CASTLE_MASK[H1] = 15 & ~CASTLE_WK;
CASTLE_MASK[A8] = 15 & ~CASTLE_BQ;
CASTLE_MASK[E8] = 15 & ~(CASTLE_BK | CASTLE_BQ);
CASTLE_MASK[H8] = 15 & ~CASTLE_BK;

// ---- Zobrist (hai thành phần 32 bit, ghép thành khóa 53 bit an toàn trong JS) ----
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return (t ^ (t >>> 14)) >>> 0;
  };
}
const rand = mulberry32(0x2b3990);
const Z_PIECE_LO = new Uint32Array(16 * 128);
const Z_PIECE_HI = new Uint32Array(16 * 128);
for (let i = 0; i < Z_PIECE_LO.length; i++) {
  Z_PIECE_LO[i] = rand();
  Z_PIECE_HI[i] = rand();
}
const Z_CASTLE_LO = Uint32Array.from({ length: 16 }, () => rand());
const Z_CASTLE_HI = Uint32Array.from({ length: 16 }, () => rand());
const Z_EP_LO = Uint32Array.from({ length: 8 }, () => rand());
const Z_EP_HI = Uint32Array.from({ length: 8 }, () => rand());
const Z_SIDE_LO = rand();
const Z_SIDE_HI = rand();

interface Undo {
  move: Move;
  castling: number;
  ep: number;
  halfmove: number;
  hashLo: number;
  hashHi: number;
}

export class Position {
  /** Bàn cờ 0x88: 0 = trống, còn lại là mã quân. */
  readonly board = new Uint8Array(128);
  /** 0 = Trắng đi, 1 = Đen đi. */
  side = 0;
  castling = 0;
  /** Ô bắt tốt qua đường, -1 nếu không có. */
  ep = -1;
  halfmove = 0;
  fullmove = 1;
  /** Vị trí Vua mỗi bên, -1 nếu không có Vua (thế mini-game). */
  readonly kings = [-1, -1];
  hashLo = 0;
  hashHi = 0;
  private readonly undoStack: Undo[] = [];
  private readonly hashHistory: number[] = [];

  static fromFen(fen: string): Position {
    const p = new Position();
    p.loadFen(fen);
    return p;
  }

  static start(): Position {
    return Position.fromFen(START_FEN);
  }

  clone(): Position {
    const p = new Position();
    p.board.set(this.board);
    p.side = this.side;
    p.castling = this.castling;
    p.ep = this.ep;
    p.halfmove = this.halfmove;
    p.fullmove = this.fullmove;
    p.kings[0] = this.kings[0]!;
    p.kings[1] = this.kings[1]!;
    p.hashLo = this.hashLo;
    p.hashHi = this.hashHi;
    p.hashHistory.push(...this.hashHistory);
    return p;
  }

  // ------------------------------------------------------------------ FEN

  loadFen(fen: string): void {
    const parts = fen.trim().split(/\s+/);
    const [placement, turn = 'w', castle = '-', ep = '-', half = '0', full = '1'] = parts;
    if (!placement) throw new Error('FEN rỗng');
    this.board.fill(0);
    this.kings[0] = -1;
    this.kings[1] = -1;
    const rows = placement.split('/');
    if (rows.length !== 8) throw new Error(`FEN phải có 8 hàng: ${fen}`);
    for (let r = 0; r < 8; r++) {
      let f = 0;
      for (const ch of rows[r]!) {
        if (ch >= '1' && ch <= '8') {
          f += Number(ch);
          continue;
        }
        const lower = ch.toLowerCase();
        if (!'pnbrqk'.includes(lower) || f > 7) throw new Error(`FEN không hợp lệ: ${fen}`);
        const color: Color = ch === lower ? 'b' : 'w';
        const sq = (7 - r) * 16 + f;
        this.board[sq] = pieceCode({ color, type: lower as PieceType });
        if (lower === 'k') this.kings[color === 'w' ? 0 : 1] = sq;
        f++;
      }
      if (f !== 8) throw new Error(`Hàng ${8 - r} trong FEN không đủ 8 ô: ${fen}`);
    }
    if (turn !== 'w' && turn !== 'b') throw new Error(`Lượt đi không hợp lệ: ${turn}`);
    this.side = turn === 'w' ? 0 : 1;
    this.castling = 0;
    if (castle !== '-') {
      for (const ch of castle) {
        if (ch === 'K') this.castling |= CASTLE_WK;
        else if (ch === 'Q') this.castling |= CASTLE_WQ;
        else if (ch === 'k') this.castling |= CASTLE_BK;
        else if (ch === 'q') this.castling |= CASTLE_BQ;
      }
    }
    this.sanitizeCastling();
    this.ep = ep === '-' ? -1 : squareIndex(ep);
    this.halfmove = Number(half) || 0;
    this.fullmove = Number(full) || 1;
    this.undoStack.length = 0;
    this.computeHash();
    this.hashHistory.length = 0;
    this.hashHistory.push(this.key());
  }

  /** Bỏ quyền nhập thành nếu Vua/Xe không còn ở ô gốc (FEN tự soạn có thể sai). */
  private sanitizeCastling(): void {
    const wk = pieceCode({ color: 'w', type: 'k' });
    const wr = pieceCode({ color: 'w', type: 'r' });
    const bk = pieceCode({ color: 'b', type: 'k' });
    const br = pieceCode({ color: 'b', type: 'r' });
    if (this.board[E1] !== wk || this.board[H1] !== wr) this.castling &= ~CASTLE_WK;
    if (this.board[E1] !== wk || this.board[A1] !== wr) this.castling &= ~CASTLE_WQ;
    if (this.board[E8] !== bk || this.board[H8] !== br) this.castling &= ~CASTLE_BK;
    if (this.board[E8] !== bk || this.board[A8] !== br) this.castling &= ~CASTLE_BQ;
  }

  toFen(): string {
    const rows: string[] = [];
    for (let r = 7; r >= 0; r--) {
      let row = '';
      let empty = 0;
      for (let f = 0; f < 8; f++) {
        const code = this.board[r * 16 + f]!;
        if (!code) {
          empty++;
          continue;
        }
        if (empty) {
          row += empty;
          empty = 0;
        }
        const t = typeOfCode(code);
        row += code & BLACK ? t : t.toUpperCase();
      }
      if (empty) row += empty;
      rows.push(row);
    }
    let castle = '';
    if (this.castling & CASTLE_WK) castle += 'K';
    if (this.castling & CASTLE_WQ) castle += 'Q';
    if (this.castling & CASTLE_BK) castle += 'k';
    if (this.castling & CASTLE_BQ) castle += 'q';
    return [
      rows.join('/'),
      this.side === 0 ? 'w' : 'b',
      castle || '-',
      this.ep === -1 ? '-' : squareName(this.ep),
      this.halfmove,
      this.fullmove,
    ].join(' ');
  }

  // ------------------------------------------------------------- truy vấn

  get turn(): Color {
    return this.side === 0 ? 'w' : 'b';
  }

  get(square: Square): Piece | null {
    return codeToPiece(this.board[squareIndex(square)]!);
  }

  /** Danh sách quân trên bàn (dùng để vẽ). */
  pieces(): Array<{ square: Square; piece: Piece }> {
    const out: Array<{ square: Square; piece: Piece }> = [];
    for (let i = 0; i < 128; i++) {
      if (i & 0x88) {
        i += 7;
        continue;
      }
      const piece = codeToPiece(this.board[i]!);
      if (piece) out.push({ square: squareName(i), piece });
    }
    return out;
  }

  /** Đặt/xóa quân (bàn xếp thế). Sau khi sửa nên gọi `normalize()`. */
  put(square: Square, piece: Piece | null): void {
    const i = squareIndex(square);
    this.board[i] = piece ? pieceCode(piece) : 0;
    this.normalize();
  }

  /** Tính lại Vua, quyền nhập thành, hash sau khi sửa bàn cờ trực tiếp. */
  normalize(): void {
    this.kings[0] = -1;
    this.kings[1] = -1;
    for (let i = 0; i < 128; i++) {
      if (i & 0x88) continue;
      const c = this.board[i]!;
      if ((c & 7) === KING) this.kings[c & BLACK ? 1 : 0] = i;
    }
    this.sanitizeCastling();
    if (this.ep !== -1) this.ep = -1;
    this.computeHash();
    this.undoStack.length = 0;
    this.hashHistory.length = 0;
    this.hashHistory.push(this.key());
  }

  /** Khóa Zobrist 53 bit. */
  key(): number {
    return (this.hashHi & 0x1fffff) * 4294967296 + this.hashLo;
  }

  private computeHash(): void {
    let lo = 0;
    let hi = 0;
    for (let i = 0; i < 128; i++) {
      if (i & 0x88) continue;
      const c = this.board[i]!;
      if (c) {
        lo ^= Z_PIECE_LO[c * 128 + i]!;
        hi ^= Z_PIECE_HI[c * 128 + i]!;
      }
    }
    lo ^= Z_CASTLE_LO[this.castling]!;
    hi ^= Z_CASTLE_HI[this.castling]!;
    if (this.ep !== -1) {
      lo ^= Z_EP_LO[fileOf(this.ep)]!;
      hi ^= Z_EP_HI[fileOf(this.ep)]!;
    }
    if (this.side === 1) {
      lo ^= Z_SIDE_LO;
      hi ^= Z_SIDE_HI;
    }
    this.hashLo = lo >>> 0;
    this.hashHi = hi >>> 0;
  }

  /** Ô `sq` có bị bên `by` (0 trắng, 1 đen) tấn công không. */
  isAttacked(sq: number, by: number): boolean {
    const b = this.board;
    const color = by === 1 ? BLACK : 0;
    // Tốt
    if (by === 0) {
      if (((sq - 15) & 0x88) === 0 && b[sq - 15] === PAWN) return true;
      if (((sq - 17) & 0x88) === 0 && b[sq - 17] === PAWN) return true;
    } else {
      if (((sq + 15) & 0x88) === 0 && b[sq + 15] === (PAWN | BLACK)) return true;
      if (((sq + 17) & 0x88) === 0 && b[sq + 17] === (PAWN | BLACK)) return true;
    }
    for (const o of KNIGHT_OFFSETS) {
      const t = sq + o;
      if ((t & 0x88) === 0 && b[t] === (KNIGHT | color)) return true;
    }
    for (const o of KING_OFFSETS) {
      const t = sq + o;
      if ((t & 0x88) === 0 && b[t] === (KING | color)) return true;
    }
    for (const o of BISHOP_OFFSETS) {
      let t = sq + o;
      while ((t & 0x88) === 0) {
        const c = b[t]!;
        if (c) {
          if (c === (BISHOP | color) || c === (QUEEN | color)) return true;
          break;
        }
        t += o;
      }
    }
    for (const o of ROOK_OFFSETS) {
      let t = sq + o;
      while ((t & 0x88) === 0) {
        const c = b[t]!;
        if (c) {
          if (c === (ROOK | color) || c === (QUEEN | color)) return true;
          break;
        }
        t += o;
      }
    }
    return false;
  }

  /** Bên `color` có đang bị chiếu không (luôn false nếu bên đó không có Vua). */
  inCheck(color: Color = this.turn): boolean {
    const idx = color === 'w' ? 0 : 1;
    const k = this.kings[idx]!;
    return k !== -1 && this.isAttacked(k, 1 - idx);
  }

  /** Các ô mà quân ở `square` đang khống chế (dừng ở quân đầu tiên trên đường đi). */
  attacksFrom(square: Square): Square[] {
    const i = squareIndex(square);
    const code = this.board[i]!;
    if (!code) return [];
    const out: Square[] = [];
    const type = code & 7;
    const black = (code & BLACK) !== 0;
    const push = (t: number) => {
      if ((t & 0x88) === 0) out.push(squareName(t));
    };
    if (type === PAWN) {
      push(i + (black ? -15 : 15));
      push(i + (black ? -17 : 17));
    } else if (type === KNIGHT) {
      for (const o of KNIGHT_OFFSETS) push(i + o);
    } else if (type === KING) {
      for (const o of KING_OFFSETS) push(i + o);
    } else {
      const offs = type === BISHOP ? BISHOP_OFFSETS : type === ROOK ? ROOK_OFFSETS : KING_OFFSETS;
      for (const o of offs) {
        let t = i + o;
        while ((t & 0x88) === 0) {
          out.push(squareName(t));
          if (this.board[t]) break;
          t += o;
        }
      }
    }
    return out;
  }

  // ------------------------------------------------------------- sinh nước

  /** Nước giả hợp lệ (chưa kiểm tra Vua bị chiếu). */
  pseudoMoves(capturesOnly = false): Move[] {
    const moves: Move[] = [];
    const b = this.board;
    const us = this.side === 1 ? BLACK : 0;
    const them = us ^ BLACK;
    const add = (from: number, to: number, piece: number, captured: number, flags: number) => {
      moves.push({ from, to, piece, captured, flags });
    };
    for (let from = 0; from < 128; from++) {
      if (from & 0x88) {
        from += 7;
        continue;
      }
      const code = b[from]!;
      if (!code || (code & BLACK) !== us) continue;
      const type = code & 7;
      if (type === PAWN) {
        const dir = us ? -16 : 16;
        const startRank = us ? 6 : 1;
        const lastRank = us ? 0 : 7;
        const one = from + dir;
        const pushPawn = (to: number, captured: number, flags: number) => {
          if (rankOf(to) === lastRank) {
            for (const promo of ['q', 'r', 'b', 'n'] as const) {
              moves.push({
                from,
                to,
                piece: code,
                captured,
                flags: flags | MoveFlag.Promotion,
                promotion: promo,
              });
            }
          } else add(from, to, code, captured, flags);
        };
        if (!capturesOnly && (one & 0x88) === 0 && !b[one]) {
          pushPawn(one, 0, MoveFlag.Normal);
          const two = one + dir;
          if (rankOf(from) === startRank && (two & 0x88) === 0 && !b[two]) {
            add(from, two, code, 0, MoveFlag.DoublePush);
          }
        }
        for (const side of [-1, 1]) {
          const to = one + side;
          if (to & 0x88) continue;
          const target = b[to]!;
          if (target && (target & BLACK) === them) pushPawn(to, target, MoveFlag.Capture);
          else if (to === this.ep && !target) {
            add(from, to, code, PAWN | them, MoveFlag.Capture | MoveFlag.EnPassant);
          }
        }
        continue;
      }
      if (type === KNIGHT || type === KING) {
        for (const o of type === KNIGHT ? KNIGHT_OFFSETS : KING_OFFSETS) {
          const to = from + o;
          if (to & 0x88) continue;
          const target = b[to]!;
          if (!target) {
            if (!capturesOnly) add(from, to, code, 0, MoveFlag.Normal);
          } else if ((target & BLACK) === them) add(from, to, code, target, MoveFlag.Capture);
        }
        if (type === KING && !capturesOnly) this.castleMoves(from, code, moves);
        continue;
      }
      const offs = type === BISHOP ? BISHOP_OFFSETS : type === ROOK ? ROOK_OFFSETS : KING_OFFSETS;
      for (const o of offs) {
        let to = from + o;
        while ((to & 0x88) === 0) {
          const target = b[to]!;
          if (!target) {
            if (!capturesOnly) add(from, to, code, 0, MoveFlag.Normal);
          } else {
            if ((target & BLACK) === them) add(from, to, code, target, MoveFlag.Capture);
            break;
          }
          to += o;
        }
      }
    }
    return moves;
  }

  private castleMoves(from: number, code: number, moves: Move[]): void {
    const b = this.board;
    const white = this.side === 0;
    const enemy = 1 - this.side;
    if (white && from === E1) {
      if (
        this.castling & CASTLE_WK &&
        !b[5] &&
        !b[6] &&
        !this.isAttacked(E1, enemy) &&
        !this.isAttacked(5, enemy) &&
        !this.isAttacked(6, enemy)
      ) {
        moves.push({ from, to: 6, piece: code, captured: 0, flags: MoveFlag.CastleKing });
      }
      if (
        this.castling & CASTLE_WQ &&
        !b[1] &&
        !b[2] &&
        !b[3] &&
        !this.isAttacked(E1, enemy) &&
        !this.isAttacked(3, enemy) &&
        !this.isAttacked(2, enemy)
      ) {
        moves.push({ from, to: 2, piece: code, captured: 0, flags: MoveFlag.CastleQueen });
      }
    } else if (!white && from === E8) {
      if (
        this.castling & CASTLE_BK &&
        !b[117] &&
        !b[118] &&
        !this.isAttacked(E8, enemy) &&
        !this.isAttacked(117, enemy) &&
        !this.isAttacked(118, enemy)
      ) {
        moves.push({ from, to: 118, piece: code, captured: 0, flags: MoveFlag.CastleKing });
      }
      if (
        this.castling & CASTLE_BQ &&
        !b[113] &&
        !b[114] &&
        !b[115] &&
        !this.isAttacked(E8, enemy) &&
        !this.isAttacked(115, enemy) &&
        !this.isAttacked(114, enemy)
      ) {
        moves.push({ from, to: 114, piece: code, captured: 0, flags: MoveFlag.CastleQueen });
      }
    }
  }

  /** Nước hợp lệ: Vua bên đi không bị chiếu sau nước đi (nếu bên đó có Vua). */
  legalMoves(capturesOnly = false): Move[] {
    const us = this.side;
    const pseudo = this.pseudoMoves(capturesOnly);
    if (this.kings[us] === -1) return pseudo;
    const legal: Move[] = [];
    for (const m of pseudo) {
      this.make(m);
      if (!this.isAttacked(this.kings[us]!, 1 - us)) legal.push(m);
      this.unmake();
    }
    return legal;
  }

  /** Các nước hợp lệ xuất phát từ một ô. */
  movesFrom(square: Square): Move[] {
    const i = squareIndex(square);
    return this.legalMoves().filter((m) => m.from === i);
  }

  // ------------------------------------------------------------ đi/hoàn

  private xorPiece(code: number, sq: number): void {
    this.hashLo = (this.hashLo ^ Z_PIECE_LO[code * 128 + sq]!) >>> 0;
    this.hashHi = (this.hashHi ^ Z_PIECE_HI[code * 128 + sq]!) >>> 0;
  }

  make(m: Move): void {
    const b = this.board;
    this.undoStack.push({
      move: m,
      castling: this.castling,
      ep: this.ep,
      halfmove: this.halfmove,
      hashLo: this.hashLo,
      hashHi: this.hashHi,
    });
    // bỏ ep & castling khỏi hash
    if (this.ep !== -1) {
      this.hashLo = (this.hashLo ^ Z_EP_LO[fileOf(this.ep)]!) >>> 0;
      this.hashHi = (this.hashHi ^ Z_EP_HI[fileOf(this.ep)]!) >>> 0;
    }
    this.hashLo = (this.hashLo ^ Z_CASTLE_LO[this.castling]!) >>> 0;
    this.hashHi = (this.hashHi ^ Z_CASTLE_HI[this.castling]!) >>> 0;

    const piece = m.piece;
    if (m.flags & MoveFlag.EnPassant) {
      const capSq = m.to + (this.side === 0 ? -16 : 16);
      this.xorPiece(b[capSq]!, capSq);
      b[capSq] = 0;
    } else if (m.captured) {
      this.xorPiece(m.captured, m.to);
    }
    this.xorPiece(piece, m.from);
    b[m.from] = 0;
    const placed = m.promotion ? typeIndex(m.promotion) | (piece & BLACK) : piece;
    b[m.to] = placed;
    this.xorPiece(placed, m.to);

    if (m.flags & (MoveFlag.CastleKing | MoveFlag.CastleQueen)) {
      const king = (m.flags & MoveFlag.CastleKing) !== 0;
      const rookFrom = king ? m.to + 1 : m.to - 2;
      const rookTo = king ? m.to - 1 : m.to + 1;
      const rook = b[rookFrom]!;
      this.xorPiece(rook, rookFrom);
      b[rookFrom] = 0;
      b[rookTo] = rook;
      this.xorPiece(rook, rookTo);
    }
    if ((piece & 7) === KING) this.kings[this.side] = m.to;
    if (m.captured && (m.captured & 7) === KING) this.kings[1 - this.side] = -1;

    this.castling &= CASTLE_MASK[m.from]! & CASTLE_MASK[m.to]!;
    this.ep = m.flags & MoveFlag.DoublePush ? (m.from + m.to) >> 1 : -1;
    this.halfmove = (piece & 7) === PAWN || m.captured ? 0 : this.halfmove + 1;
    if (this.side === 1) this.fullmove++;
    this.side ^= 1;

    this.hashLo = (this.hashLo ^ Z_CASTLE_LO[this.castling]! ^ Z_SIDE_LO) >>> 0;
    this.hashHi = (this.hashHi ^ Z_CASTLE_HI[this.castling]! ^ Z_SIDE_HI) >>> 0;
    if (this.ep !== -1) {
      this.hashLo = (this.hashLo ^ Z_EP_LO[fileOf(this.ep)]!) >>> 0;
      this.hashHi = (this.hashHi ^ Z_EP_HI[fileOf(this.ep)]!) >>> 0;
    }
    this.hashHistory.push(this.key());
  }

  unmake(): Move | undefined {
    const u = this.undoStack.pop();
    if (!u) return undefined;
    const m = u.move;
    const b = this.board;
    this.side ^= 1;
    if (this.side === 1) this.fullmove--;
    b[m.from] = m.piece;
    if (m.flags & MoveFlag.EnPassant) {
      b[m.to] = 0;
      b[m.to + (this.side === 0 ? -16 : 16)] = m.captured;
    } else {
      b[m.to] = m.captured;
    }
    if (m.flags & (MoveFlag.CastleKing | MoveFlag.CastleQueen)) {
      const king = (m.flags & MoveFlag.CastleKing) !== 0;
      const rookFrom = king ? m.to + 1 : m.to - 2;
      const rookTo = king ? m.to - 1 : m.to + 1;
      b[rookFrom] = b[rookTo]!;
      b[rookTo] = 0;
    }
    if ((m.piece & 7) === KING) this.kings[this.side] = m.from;
    if (m.captured && (m.captured & 7) === KING) this.kings[1 - this.side] = m.to;
    this.castling = u.castling;
    this.ep = u.ep;
    this.halfmove = u.halfmove;
    this.hashLo = u.hashLo;
    this.hashHi = u.hashHi;
    this.hashHistory.pop();
    return m;
  }

  /** Nước "bỏ lượt" — dùng cho mini-game một bên (đối phương đứng yên). */
  makeNull(): void {
    this.undoStack.push({
      move: { from: 0, to: 0, piece: 0, captured: 0, flags: -1 },
      castling: this.castling,
      ep: this.ep,
      halfmove: this.halfmove,
      hashLo: this.hashLo,
      hashHi: this.hashHi,
    });
    if (this.ep !== -1) {
      this.hashLo = (this.hashLo ^ Z_EP_LO[fileOf(this.ep)]!) >>> 0;
      this.hashHi = (this.hashHi ^ Z_EP_HI[fileOf(this.ep)]!) >>> 0;
    }
    this.ep = -1;
    this.side ^= 1;
    this.hashLo = (this.hashLo ^ Z_SIDE_LO) >>> 0;
    this.hashHi = (this.hashHi ^ Z_SIDE_HI) >>> 0;
    this.hashHistory.push(this.key());
  }

  unmakeNull(): void {
    const u = this.undoStack.pop();
    if (!u) return;
    this.side ^= 1;
    this.ep = u.ep;
    this.hashLo = u.hashLo;
    this.hashHi = u.hashHi;
    this.hashHistory.pop();
  }

  get ply(): number {
    return this.undoStack.length;
  }

  // ------------------------------------------------------------ kết thúc

  repetitions(): number {
    const k = this.key();
    let n = 0;
    for (const h of this.hashHistory) if (h === k) n++;
    return n;
  }

  insufficientMaterial(): boolean {
    let minors = 0;
    const bishopColors: number[] = [];
    for (let i = 0; i < 128; i++) {
      if (i & 0x88) continue;
      const c = this.board[i]!;
      if (!c) continue;
      const t = c & 7;
      if (t === KING) continue;
      if (t === PAWN || t === ROOK || t === QUEEN) return false;
      minors++;
      if (t === BISHOP) bishopColors.push((fileOf(i) + rankOf(i)) % 2);
    }
    if (minors <= 1) return true;
    return bishopColors.length === minors && bishopColors.every((c) => c === bishopColors[0]);
  }

  /** Kết quả ván theo luật chuẩn, `null` nếu ván chưa kết thúc. */
  outcome(): Outcome | null {
    if (this.legalMoves().length === 0) {
      if (this.inCheck()) return { kind: 'checkmate', winner: this.side === 0 ? 'b' : 'w' };
      return { kind: 'stalemate' };
    }
    if (this.halfmove >= 100) return { kind: 'fifty-move' };
    if (this.repetitions() >= 3) return { kind: 'threefold' };
    if (this.kings[0] !== -1 && this.kings[1] !== -1 && this.insufficientMaterial()) {
      return { kind: 'insufficient' };
    }
    return null;
  }

  /** Kiểm tra thế cờ chuẩn (bàn xếp thế): trả về danh sách lỗi, rỗng nếu hợp lệ. */
  validateStandard(): string[] {
    const errors: string[] = [];
    let wk = 0;
    let bk = 0;
    for (let i = 0; i < 128; i++) {
      if (i & 0x88) continue;
      const c = this.board[i]!;
      if ((c & 7) === KING) {
        if (c & BLACK) bk++;
        else wk++;
      }
      if ((c & 7) === PAWN && (rankOf(i) === 0 || rankOf(i) === 7)) {
        errors.push(`Tốt không được đứng ở hàng 1 hoặc 8 (${squareName(i)})`);
      }
    }
    if (wk !== 1) errors.push('Trắng phải có đúng 1 Vua');
    if (bk !== 1) errors.push('Đen phải có đúng 1 Vua');
    if (wk === 1 && bk === 1 && this.inCheck(this.side === 0 ? 'b' : 'w')) {
      errors.push('Bên không đến lượt đang bị chiếu');
    }
    return errors;
  }

  colorAt(sq: number): Color | null {
    const c = this.board[sq]!;
    return c ? colorOfCode(c) : null;
  }
}

export { BISHOP, KING, KNIGHT, PAWN, QUEEN, ROOK };
