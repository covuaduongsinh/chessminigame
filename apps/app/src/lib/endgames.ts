import { ENDGAMES, type MiniGame } from '@duongsinh/minigames';

/** Biến thế tàn cuộc thành một "mini-game" một vòng để dùng chung màn chơi. */
export function endgameAsMiniGame(id: string): MiniGame | undefined {
  const e = ENDGAMES.find((x) => x.id === id);
  if (!e) return undefined;
  return {
    id: e.id,
    level: 'vua',
    order: 0,
    title: e.title,
    story: e.description,
    goal:
      e.round.mode === 'mate'
        ? { vi: `Chiếu hết trong ${e.round.moveLimit} nước.`, en: `Checkmate within ${e.round.moveLimit} moves.` }
        : { vi: 'Phong cấp Tốt (đừng để mất Tốt!).', en: 'Promote the pawn (don’t lose it!).' },
    lesson: e.description,
    rounds: [e.round],
    skills: ['endgame'],
  };
}
