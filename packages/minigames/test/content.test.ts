import { findUci, Position, parsePgn, squareName } from '@duongsinh/chess-core';
import { describe, expect, it } from 'vitest';
import {
  CLASSICS,
  ENDGAMES,
  getMiniGame,
  isUnlocked,
  LEVELS,
  MINIGAMES,
  MiniGameSession,
  miniGamesOf,
  solveCollect,
} from '../src';

describe('danh mục mini-game', () => {
  it('có ít nhất 36 bài, mỗi cấp 6 bài, id không trùng', () => {
    expect(MINIGAMES.length).toBeGreaterThanOrEqual(36);
    for (const l of LEVELS) expect(miniGamesOf(l.key)).toHaveLength(6);
    expect(new Set(MINIGAMES.map((g) => g.id)).size).toBe(MINIGAMES.length);
  });

  it('mọi FEN đều hợp lệ và có đủ song ngữ', () => {
    for (const g of MINIGAMES) {
      for (const text of [g.title, g.story, g.goal, g.lesson]) {
        expect(text.vi.length, g.id).toBeGreaterThan(0);
        expect(text.en.length, g.id).toBeGreaterThan(0);
      }
      for (const r of g.rounds) {
        if (r.mode === 'quiz') {
          for (const q of r.questions) if ('fen' in q && q.fen) Position.fromFen(q.fen);
        } else Position.fromFen(r.fen);
      }
    }
  });

  it('mở khóa tuần tự', () => {
    expect(isUnlocked('tot-1', {})).toBe(true);
    expect(isUnlocked('tot-2', {})).toBe(false);
    expect(isUnlocked('tot-2', { 'tot-1': 1 })).toBe(true);
  });
});

describe('bài ăn sao giải được', () => {
  for (const g of MINIGAMES) {
    g.rounds.forEach((r, i) => {
      if (r.mode !== 'collect') return;
      it(`${g.id} vòng ${i + 1}`, () => {
        // các ô sao không được trùng nhau và (trừ chế độ bắt quân) phải trống
        expect(new Set(r.targets).size).toBe(r.targets.length);
        const path = solveCollect(r);
        expect(path, `${g.id} không giải được`).not.toBeNull();
        expect(path!.length).toBeGreaterThan(0);
      });
    });
  }

  it('chơi đúng lời giải thì thắng 3 sao', () => {
    const def = getMiniGame('ma-1')!;
    const s = new MiniGameSession(def, { seed: 1 });
    for (const uci of solveCollect(def.rounds[0] as never)!) {
      s.playerMove(uci.slice(0, 2) as never, uci.slice(2, 4) as never);
    }
    expect(s.status).toBe('won');
    expect(s.stars()).toBe(3);
  });

  it('nhảy vào ô bẫy thì thua', () => {
    const s = new MiniGameSession(getMiniGame('xe-5')!, { seed: 1 });
    const ev = s.playerMove('a1', 'a6'); // a6 được Tốt b7 bảo vệ
    expect(ev.some((e) => e.type === 'trap')).toBe(true);
    expect(s.status).toBe('lost');
    s.restartRound();
    expect(s.status).toBe('playing');
  });
});

describe('bài tập có lời giải hợp lệ', () => {
  for (const g of MINIGAMES) {
    g.rounds.forEach((r, i) => {
      if (r.mode !== 'puzzle') return;
      it(`${g.id} vòng ${i + 1}`, () => {
        const pos = Position.fromFen(r.fen);
        for (const uci of r.solution) {
          const m = findUci(pos, uci);
          expect(m, `${g.id}: ${uci} không hợp lệ`).toBeDefined();
          pos.make(m!);
        }
        if (r.anyMate) expect(pos.outcome()?.kind, `${g.id} chưa chiếu hết`).toBe('checkmate');
      });
    });
  }

  it('thoát chiếu: mỗi thế chỉ có đúng 1 nước hợp lệ', () => {
    for (const r of getMiniGame('vua-2')!.rounds) {
      if (r.mode !== 'puzzle') continue;
      const pos = Position.fromFen(r.fen);
      expect(pos.inCheck()).toBe(true);
      expect(pos.legalMoves().map((m) => squareName(m.from) + squareName(m.to))).toEqual([
        r.solution[0],
      ]);
    }
  });

  it('phiên bài tập: sai thì bị trừ sao, đúng thì máy trả lời tự động', () => {
    const s = new MiniGameSession(getMiniGame('xe-3')!, { seed: 1 });
    expect(s.playerMove('a1', 'a2').some((e) => e.type === 'mistake')).toBe(true);
    s.playerMove('a1', 'a5');
    s.engineMove();
    s.playerMove('a5', 'h5');
    expect(s.status).toBe('round-won');
    s.nextRound();
    s.playerMove('h8', 'b8');
    s.engineMove();
    s.playerMove('b8', 'b2');
    expect(s.status).toBe('won');
    expect(s.stars()).toBe(2);
  });
});

describe('câu hỏi', () => {
  it('đáp án hợp lệ', () => {
    for (const g of MINIGAMES) {
      for (const r of g.rounds) {
        if (r.mode !== 'quiz') continue;
        for (const q of r.questions) {
          if (q.kind === 'squares') expect(q.answer.length, g.id).toBeGreaterThan(0);
          if (q.kind === 'choice') {
            expect(q.answer, g.id).toBeGreaterThanOrEqual(0);
            expect(q.answer, g.id).toBeLessThan(q.options.length);
          }
        }
      }
    }
  });

  it('chơi hết câu hỏi tìm ô', () => {
    const s = new MiniGameSession(getMiniGame('tot-1')!, { seed: 3 });
    let guard = 0;
    while (s.status === 'playing' && guard++ < 20) {
      const q = s.quizState()!;
      s.tapSquare(q.target!);
    }
    expect(s.status).toBe('won');
    expect(s.stars()).toBe(3);
  });

  it('chiếu hết hay hòa: đáp án đúng', () => {
    const r = getMiniGame('vua-3')!.rounds[0]!;
    if (r.mode !== 'quiz') throw new Error();
    expect(r.questions.map((q) => (q.kind === 'choice' ? q.answer : -1))).toEqual([0, 1, 0, 2, 1]);
  });
});

describe('ván kinh điển', () => {
  for (const c of CLASSICS) {
    it(`${c.id} đọc được PGN`, () => {
      const g = parsePgn(c.pgn);
      expect(g.moves.length).toBeGreaterThan(0);
      for (const ply of Object.keys(c.notes))
        expect(Number(ply)).toBeLessThanOrEqual(g.moves.length);
    });
  }
  it('đủ 10 ván và 12 thế tàn cuộc', () => {
    expect(CLASSICS).toHaveLength(10);
    expect(ENDGAMES).toHaveLength(12);
  });
});
