import type { MiniGame } from '@duongsinh/minigames';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface LocalCustomGame {
  id: string;
  title: string;
  def: MiniGame;
  /** id trên máy chủ sau khi chia sẻ cho nhóm (mỗi nhóm một bản). */
  shared: Record<string, string>;
  createdAt: number;
}

interface CustomState {
  items: Record<string, LocalCustomGame>;
  add: (g: Omit<LocalCustomGame, 'shared' | 'createdAt'>) => void;
  remove: (id: string) => void;
  markShared: (id: string, groupId: string, remoteId: string) => void;
}

/** Bài HLV tự tạo, lưu trên máy (dùng được khi ngoại tuyến). */
export const useCustomGames = create<CustomState>()(
  persist(
    (set) => ({
      items: {},
      add: (g) =>
        set((s) => ({
          items: { ...s.items, [g.id]: { ...g, shared: {}, createdAt: Date.now() } },
        })),
      remove: (id) =>
        set((s) => {
          const items = { ...s.items };
          delete items[id];
          return { items };
        }),
      markShared: (id, groupId, remoteId) =>
        set((s) => {
          const g = s.items[id];
          if (!g) return s;
          return {
            items: { ...s.items, [id]: { ...g, shared: { ...g.shared, [groupId]: remoteId } } },
          };
        }),
    }),
    { name: 'ds-custom-games', storage: createJSONStorage(() => AsyncStorage) },
  ),
);
