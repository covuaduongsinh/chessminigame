import { CLASSICS } from './content/classics';
import { ENDGAMES } from './content/endgames';
import { HAU } from './content/hau';
import { MA } from './content/ma';
import { TOT } from './content/tot';
import { TUONG } from './content/tuong';
import { VUA } from './content/vua';
import { XE } from './content/xe';
import { LEVELS } from './levels';
import type { LevelKey, MiniGame } from './types';

export * from './custom';
export * from './explain';
export * from './levels';
export * from './questions';
export * from './rules';
export * from './session';
export * from './types';
export { CLASSICS, ENDGAMES };

/** Toàn bộ mini-game theo lộ trình Tốt → Vua. */
export const MINIGAMES: readonly MiniGame[] = [...TOT, ...MA, ...TUONG, ...XE, ...HAU, ...VUA];

const BY_ID = new Map(MINIGAMES.map((g) => [g.id, g]));

export function getMiniGame(id: string): MiniGame | undefined {
  return BY_ID.get(id);
}

export function miniGamesOf(level: LevelKey): MiniGame[] {
  return MINIGAMES.filter((g) => g.level === level).sort((a, b) => a.order - b.order);
}

/** Mini-game kế tiếp trong lộ trình (để nút "Bài tiếp theo"). */
export function nextMiniGame(id: string): MiniGame | undefined {
  const i = MINIGAMES.findIndex((g) => g.id === id);
  return i >= 0 ? MINIGAMES[i + 1] : undefined;
}

/**
 * Mở khóa: bài đầu tiên luôn mở; mỗi bài mở khi bài trước đạt ít nhất 1 sao.
 * Cấp mới mở khi cấp trước đạt tổng số sao ≥ số bài × 1.
 */
export function isUnlocked(id: string, stars: Record<string, number>): boolean {
  const i = MINIGAMES.findIndex((g) => g.id === id);
  if (i <= 0) return i === 0;
  return (stars[MINIGAMES[i - 1]!.id] ?? 0) > 0;
}

export function levelProgress(level: LevelKey, stars: Record<string, number>) {
  const games = miniGamesOf(level);
  const earned = games.reduce((s, g) => s + (stars[g.id] ?? 0), 0);
  return {
    earned,
    total: games.length * 3,
    completed: games.filter((g) => (stars[g.id] ?? 0) > 0).length,
    count: games.length,
  };
}

export const LEVEL_KEYS = LEVELS.map((l) => l.key);
