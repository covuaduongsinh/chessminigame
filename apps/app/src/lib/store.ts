import { type ProgressDelta, randomNickname } from '@duongsinh/sync';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Lang } from './i18n';

export interface ItemProgress {
  stars: number;
  moves: number | null;
  attempts: number;
  updatedAt: number;
}

interface ProgressState {
  items: Record<string, ItemProgress>;
  /** Hàng đợi chờ đẩy lên máy chủ. */
  outbox: ProgressDelta[];
  lastSync: number | null;
  playStats: Record<string, { w: number; d: number; l: number }>;
  /** Ghi kết quả một lần chơi (stars = 0 nghĩa là chưa thắng). */
  record: (itemId: string, stars: number, moves: number | null) => void;
  recordGame: (level: number, result: 'w' | 'd' | 'l') => void;
  merge: (
    rows: Array<{
      item_id: string;
      best_stars: number;
      best_moves: number | null;
      attempts: number;
    }>,
  ) => void;
  takeOutbox: () => ProgressDelta[];
  restoreOutbox: (items: ProgressDelta[]) => void;
  setLastSync: (t: number) => void;
  reset: () => void;
}

export const useProgress = create<ProgressState>()(
  persist(
    (set, get) => ({
      items: {},
      outbox: [],
      lastSync: null,
      playStats: {},
      record: (itemId, stars, moves) =>
        set((s) => {
          const prev = s.items[itemId];
          const best: ItemProgress = {
            stars: Math.max(prev?.stars ?? 0, stars),
            moves:
              stars > 0
                ? prev?.moves == null
                  ? moves
                  : moves == null
                    ? prev.moves
                    : Math.min(prev.moves, moves)
                : (prev?.moves ?? null),
            attempts: (prev?.attempts ?? 0) + 1,
            updatedAt: Date.now(),
          };
          return {
            items: { ...s.items, [itemId]: best },
            outbox: [
              ...s.outbox,
              { item_id: itemId, stars, moves: stars > 0 ? moves : null, attempts: 1 },
            ],
          };
        }),
      recordGame: (level, result) =>
        set((s) => {
          const key = String(level);
          const cur = s.playStats[key] ?? { w: 0, d: 0, l: 0 };
          return { playStats: { ...s.playStats, [key]: { ...cur, [result]: cur[result] + 1 } } };
        }),
      merge: (rows) =>
        set((s) => {
          const items = { ...s.items };
          for (const r of rows) {
            const prev = items[r.item_id];
            items[r.item_id] = {
              stars: Math.max(prev?.stars ?? 0, r.best_stars),
              moves:
                prev?.moves == null
                  ? r.best_moves
                  : r.best_moves == null
                    ? prev.moves
                    : Math.min(prev.moves, r.best_moves),
              attempts: Math.max(prev?.attempts ?? 0, r.attempts),
              updatedAt: Date.now(),
            };
          }
          return { items };
        }),
      takeOutbox: () => {
        const out = get().outbox;
        set({ outbox: [] });
        return out;
      },
      restoreOutbox: (items) => set((s) => ({ outbox: [...items, ...s.outbox] })),
      setLastSync: (t) => set({ lastSync: t }),
      reset: () => set({ items: {}, outbox: [], playStats: {} }),
    }),
    { name: 'ds-progress', storage: createJSONStorage(() => AsyncStorage) },
  ),
);

/** Số sao theo id (để tính mở khóa). */
export function starsMap(items: Record<string, ItemProgress>): Record<string, number> {
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(items)) out[k] = v.stars;
  return out;
}

interface SettingsState {
  lang: Lang | null;
  sound: boolean;
  coords: boolean;
  boardTheme: string;
  nickname: string | null;
  avatar: string;
  set: (patch: Partial<Omit<SettingsState, 'set'>>) => void;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      lang: null,
      sound: true,
      coords: true,
      boardTheme: 'duongsinh',
      nickname: null,
      avatar: 'p',
      set: (patch) => set(patch),
    }),
    {
      name: 'ds-settings',
      storage: createJSONStorage(() => AsyncStorage),
      // Lần đầu mở app: tự đặt một tên ngẫu nhiên (dùng được cả khi ngoại tuyến).
      onRehydrateStorage: () => (state) => {
        if (state && !state.nickname) {
          const n = randomNickname();
          state.set({ nickname: n.nickname, avatar: n.avatar });
        }
      },
    },
  ),
);
