import { moveToUci, type Square } from '@duongsinh/chess-core';
import { bestMove } from '@duongsinh/engine';
import { describe, expect, it } from 'vitest';
import { ENDGAMES, MINIGAMES, type MiniGame, MiniGameSession, objectiveFor } from '../src';

const ENGINE_MODES = new Set(['race', 'stop', 'survive', 'mate', 'play']);

/** Người chơi "giỏi" (dùng máy mạnh) phải thắng được mọi bài đấu với máy. */
function playStrong(def: MiniGame, seed: number, thinkMs = 250): MiniGameSession {
  const s = new MiniGameSession(def, { seed });
  for (
    let guard = 0;
    guard < 400 && (s.status === 'playing' || s.status === 'round-won');
    guard++
  ) {
    if (s.status === 'round-won') {
      s.nextRound();
      continue;
    }
    if (s.isPlayerTurn) {
      const m = bestMove(s.position, { timeMs: thinkMs, objective: objectiveFor(s.round) }).move!;
      const uci = moveToUci(m);
      s.playerMove(uci.slice(0, 2) as Square, uci.slice(2, 4) as Square, m.promotion);
    } else s.engineMove();
  }
  return s;
}

describe('bài đấu với máy thắng được', () => {
  for (const g of MINIGAMES.filter((x) => x.rounds.some((r) => ENGINE_MODES.has(r.mode)))) {
    it(g.id, () => {
      const s = playStrong(g, 11);
      expect(s.status, `${g.id}: ${s.lostReason?.vi ?? ''} — ${s.position.toFen()}`).toBe('won');
    }, 120_000);
  }
});

describe('tàn cuộc thắng được', () => {
  for (const e of ENDGAMES) {
    it(e.id, () => {
      const def: MiniGame = {
        id: e.id,
        level: 'vua',
        order: 0,
        title: e.title,
        story: e.description,
        goal: e.description,
        lesson: e.description,
        rounds: [e.round],
        skills: [],
      };
      const s = playStrong(def, 5, 400);
      expect(s.status, `${e.id}: ${s.lostReason?.vi ?? ''} — ${s.position.toFen()}`).toBe('won');
    }, 120_000);
  }
});
