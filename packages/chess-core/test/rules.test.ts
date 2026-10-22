import { describe, expect, it } from 'vitest';
import { explainIllegalMove, Game, Position, parsePgn, parseSan, toSan } from '../src';

describe('FEN', () => {
  it('đọc rồi ghi lại giống hệt', () => {
    const fens = [
      'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1',
      'r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1',
      '8/8/8/8/8/8/PPPPPPPP/8 w - - 0 1',
    ];
    for (const f of fens) expect(Position.fromFen(f).toFen()).toBe(f);
  });

  it('hash tăng dần khớp với hash tính lại từ FEN', () => {
    const g = new Game();
    for (const san of ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'a6']) {
      const m = parseSan(g.position, san)!;
      g.apply(m);
      expect(g.position.key()).toBe(Position.fromFen(g.fen).key());
    }
  });
});

describe('SAN', () => {
  it('phân biệt quân cùng loại', () => {
    const pos = Position.fromFen('7k/8/8/8/8/8/8/R5RK w - - 0 1');
    const m = pos.legalMoves().find((x) => x.from === 0 && x.to === 3)!;
    expect(toSan(pos, m)).toBe('Rad1');
  });
  it('chiếu hết có dấu #', () => {
    const g = new Game();
    for (const s of ['f3', 'e5', 'g4']) g.apply(parseSan(g.position, s)!);
    const m = parseSan(g.position, 'Qh4')!;
    expect(toSan(g.position, m)).toBe('Qh4#');
    g.apply(m);
    expect(g.outcome()).toEqual({ kind: 'checkmate', winner: 'b' });
  });
  it('nhập thành và phong cấp', () => {
    const pos = Position.fromFen('4k3/P7/8/8/8/8/8/R3K2R w KQ - 0 1');
    expect(parseSan(pos, 'O-O')).toBeDefined();
    expect(parseSan(pos, '0-0-0')).toBeDefined();
    expect(parseSan(pos, 'a8=Q+')?.promotion).toBe('q');
    expect(parseSan(pos, 'a8N')?.promotion).toBe('n');
  });
});

describe('kết thúc ván', () => {
  it('hết nước đi (stalemate)', () => {
    expect(Position.fromFen('7k/5Q2/6K1/8/8/8/8/8 b - - 0 1').outcome()).toEqual({
      kind: 'stalemate',
    });
  });
  it('không đủ quân', () => {
    expect(Position.fromFen('8/8/4k3/8/8/2KB4/8/8 w - - 0 1').outcome()).toEqual({
      kind: 'insufficient',
    });
  });
  it('lặp lại 3 lần', () => {
    const g = new Game();
    for (const s of ['Nf3', 'Nf6', 'Ng1', 'Ng8', 'Nf3', 'Nf6', 'Ng1', 'Ng8'])
      g.apply(parseSan(g.position, s)!);
    expect(g.outcome()).toEqual({ kind: 'threefold' });
  });
});

describe('thế mini-game không có Vua', () => {
  it('sinh nước bình thường khi không có Vua', () => {
    const pos = Position.fromFen('8/8/8/8/8/8/8/N7 w - - 0 1');
    expect(
      pos
        .legalMoves()
        .map((m) => m.to)
        .sort(),
    ).toEqual([33, 18].sort());
    expect(pos.inCheck()).toBe(false);
  });
  it('khống chế ô của Tượng', () => {
    const pos = Position.fromFen('8/8/8/8/3B4/8/8/8 w - - 0 1');
    expect(pos.attacksFrom('d4')).toHaveLength(13);
  });
});

describe('PGN', () => {
  it('đọc ván Opera Game (Morphy 1858)', () => {
    const pgn = `[Event "Paris"]
[White "Paul Morphy"]
[Black "Duke Karl / Count Isouard"]
[Result "1-0"]

1. e4 e5 2. Nf3 d6 3. d4 Bg4 {Ghim Mã} 4. dxe5 Bxf3 5. Qxf3 dxe5 6. Bc4 Nf6 7. Qb3 Qe7
8. Nc3 c6 9. Bg5 b5 10. Nxb5 cxb5 11. Bxb5+ Nbd7 12. O-O-O Rd8 13. Rxd7 Rxd7
14. Rd1 Qe6 15. Bxd7+ Nxd7 16. Qb8+ Nxb8 17. Rd8# 1-0`;
    const g = parsePgn(pgn);
    expect(g.moves).toHaveLength(33);
    expect(g.moves[5]!.comment).toBe('Ghim Mã');
    expect(g.moves.at(-1)!.san).toBe('Rd8#');
    expect(g.result).toBe('1-0');
  });
  it('bỏ qua biến phụ và NAG', () => {
    const g = parsePgn('1. e4 $1 (1. d4 d5) 1... e5 2. Nf3 *');
    expect(g.moves.map((m) => m.san)).toEqual(['e4', 'e5', 'Nf3']);
  });
  it('xuất PGN đọc lại được', () => {
    const g = new Game();
    for (const s of ['e4', 'e5', 'Qh5', 'Nc6', 'Bc4', 'Nf6', 'Qxf7#'])
      g.apply(parseSan(g.position, s)!);
    const back = parsePgn(g.pgn({ White: 'An', Black: 'Bình' }));
    expect(back.moves.map((m) => m.san)).toEqual(['e4', 'e5', 'Qh5', 'Nc6', 'Bc4', 'Nf6', 'Qxf7#']);
    expect(back.result).toBe('1-0');
  });
});

describe('giải thích nước đi sai', () => {
  const why = (fen: string, from: string, to: string) =>
    explainIllegalMove(Position.fromFen(fen), from as never, to as never)?.reason ?? null;
  it('các lỗi thường gặp của trẻ', () => {
    const start = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    expect(why(start, 'e2', 'e4')).toBeNull();
    expect(why(start, 'e7', 'e5')).toBe('not-your-turn');
    expect(why(start, 'e3', 'e4')).toBe('no-piece');
    expect(why(start, 'a1', 'a3')).toBe('blocked');
    expect(why(start, 'a1', 'a2')).toBe('own-piece');
    expect(why(start, 'g1', 'g3')).toBe('cannot-move-like-that');
    expect(why(start, 'e2', 'f3')).toBe('pawn-diagonal-empty');
    expect(why('8/8/8/8/4p3/4P3/8/8 w - - 0 1', 'e3', 'e4')).toBe('pawn-straight-capture');
    expect(why('8/8/8/8/8/4P3/8/8 w - - 0 1', 'e3', 'e2')).toBe('pawn-backward');
    expect(why('8/8/8/8/8/4P3/8/8 w - - 0 1', 'e3', 'e5')).toBe('cannot-move-like-that');
  });
  it('Vua, chiếu và ghim', () => {
    expect(why('4k3/8/8/8/8/8/8/4K2r w - - 0 1', 'e1', 'f1')).toBe('king-into-check');
    expect(why('4k3/8/8/8/8/8/3P4/r3K3 w - - 0 1', 'd2', 'd3')).toBe('in-check');
    expect(why('4k3/4r3/8/8/8/8/4B3/4K3 w - - 0 1', 'e2', 'd3')).toBe('pinned');
    expect(why('4k3/8/8/8/8/8/8/4K2R w - - 0 1', 'e1', 'g1')).toBe('castle-rule');
  });
});
