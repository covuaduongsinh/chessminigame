import { Game, moveToUci, Position, START_FEN } from '@duongsinh/chess-core';
import { describe, expect, it } from 'vitest';
import { bestMove, chooseMove, createRng, LEVELS } from '../src';

describe('engine', () => {
  it('mọi cấp đều trả về nước hợp lệ', () => {
    const fens = [
      START_FEN,
      'r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1',
      '8/8/8/8/8/8/PPPPPPPP/8 w - - 0 1',
    ];
    for (const fen of fens) {
      for (const level of LEVELS) {
        const pos = Position.fromFen(fen);
        const m = chooseMove(pos, level.id, { rng: createRng(7), timeMs: 200 });
        expect(m).not.toBeNull();
        const legal = pos.legalMoves().map(moveToUci);
        expect(legal).toContain(moveToUci(m!));
        expect(pos.toFen()).toBe(fen); // không làm hỏng thế cờ gốc
      }
    }
  });

  it('Máy Vua thấy chiếu hết 1 nước', () => {
    const pos = Position.fromFen(
      'r1bqkbnr/pppp1ppp/2n5/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4',
    );
    expect(moveToUci(bestMove(pos, { timeMs: 500 }).move!)).toBe('h5f7');
  });

  it('thấy chiếu hết 2 nước', () => {
    // Chiếu hết kiểu "Mã ngạt": 1.Qg8+ Rxg8 2.Nf7#
    const pos = Position.fromFen('r6k/6pp/7N/8/8/1Q6/8/6K1 w - - 0 1');
    const r = bestMove(pos, { timeMs: 2000 });
    expect(moveToUci(r.move!)).toBe('b3g8');
  });

  it('ăn Hậu đang bị treo', () => {
    const pos = Position.fromFen('rnb1kbnr/pppp1ppp/8/4p1q1/3PP3/8/PPP2PPP/RNBQKBNR w KQkq - 1 3');
    expect(moveToUci(bestMove(pos, { timeMs: 500 }).move!)).toBe('c1g5');
  });

  it('cấp cao mạnh hơn hẳn cấp thấp', () => {
    let strongScore = 0;
    for (const seed of [1, 2]) {
      const g = new Game();
      const rng = createRng(seed);
      const strongIsWhite = seed % 2 === 1;
      for (let ply = 0; ply < 120 && !g.outcome(); ply++) {
        const strongTurn = (g.turn === 'w') === strongIsWhite;
        const m = chooseMove(g.position, strongTurn ? 5 : 1, { rng, timeMs: 150 });
        g.apply(m!);
      }
      const o = g.outcome();
      if (o?.kind === 'checkmate') {
        if ((o.winner === 'w') === strongIsWhite) strongScore += 1;
      } else {
        // chưa hết ván: so vật chất
        const material = g.position.pieces().reduce((s, p) => {
          const v = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 }[p.piece.type];
          return s + ((p.piece.color === 'w') === strongIsWhite ? v : -v);
        }, 0);
        if (material > 0) strongScore += 1;
      }
    }
    expect(strongScore).toBe(2);
  }, 60_000);

  it('mục tiêu mini-game: ưu tiên đẩy Tốt khi đua phong cấp', () => {
    const pos = Position.fromFen('8/pppppppp/8/8/8/8/PPPPPPPP/8 w - - 0 1');
    const race = {
      evaluate: (p: Position) => {
        let s = 0;
        for (const { square, piece } of p.pieces()) {
          const rank = Number(square[1]);
          s += piece.color === 'w' ? rank * 10 : -(9 - rank) * 10;
        }
        return s;
      },
    };
    const m = bestMove(pos, { timeMs: 300, objective: race }).move!;
    expect(m.to - m.from).toBe(32); // đẩy 2 ô
  });
});
