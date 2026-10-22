import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createSyncClient,
  DEFAULT_SYNC_CONFIG,
  type DB,
  ensureSession,
  type Profile,
  pullProgress,
  pushProgress,
  randomNickname,
  updateProfile,
} from '@duongsinh/sync';
import { Platform } from 'react-native';
import { create } from 'zustand';
import { useProgress, useSettings } from './store';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL ?? DEFAULT_SYNC_CONFIG.url;
const key = process.env.EXPO_PUBLIC_SUPABASE_KEY ?? DEFAULT_SYNC_CONFIG.key;

let client: DB | null = null;

/** Client Supabase dùng chung (null nếu tắt đồng bộ bằng EXPO_PUBLIC_SYNC=off). */
export function db(): DB | null {
  if (process.env.EXPO_PUBLIC_SYNC === 'off') return null;
  if (!client) {
    client = createSyncClient({
      url,
      key,
      storage: AsyncStorage,
      detectSessionInUrl: Platform.OS === 'web',
    });
  }
  return client;
}

type Status = 'idle' | 'connecting' | 'ready' | 'offline' | 'error';

interface AccountState {
  status: Status;
  profile: Profile | null;
  error: string | null;
  connect: () => Promise<Profile | null>;
  rename: (nickname: string, avatar?: string) => Promise<void>;
  setProfile: (p: Profile) => void;
}

export const useAccount = create<AccountState>()((set, get) => ({
  status: 'idle',
  profile: null,
  error: null,
  setProfile: (p) => set({ profile: p }),
  connect: async () => {
    const c = db();
    if (!c) {
      set({ status: 'offline' });
      return null;
    }
    if (get().status === 'connecting') return get().profile;
    set({ status: 'connecting', error: null });
    try {
      const s = useSettings.getState();
      const preferred = s.nickname ? { nickname: s.nickname, avatar: s.avatar } : randomNickname();
      const profile = await ensureSession(c, preferred);
      useSettings.getState().set({ nickname: profile.nickname, avatar: profile.avatar });
      set({ status: 'ready', profile });
      await syncNow();
      return profile;
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      set({ status: /mạng|network|fetch/i.test(message) ? 'offline' : 'error', error: message });
      return null;
    }
  },
  rename: async (nickname, avatar) => {
    const c = db();
    useSettings.getState().set({ nickname, ...(avatar ? { avatar } : {}) });
    if (!c || get().status !== 'ready') return;
    const p = await updateProfile(c, { nickname, avatar });
    set({ profile: p });
  },
}));

let syncing = false;

/** Đẩy outbox lên máy chủ và kéo tiến độ về (gộp thành tích tốt nhất). */
export async function syncNow(): Promise<boolean> {
  const c = db();
  const profile = useAccount.getState().profile;
  if (!c || !profile || syncing) return false;
  syncing = true;
  const store = useProgress.getState();
  const batch = store.takeOutbox();
  try {
    if (batch.length) await pushProgress(c, batch);
    const rows = await pullProgress(c, profile.id);
    useProgress.getState().merge(rows);
    useProgress.getState().setLastSync(Date.now());
    return true;
  } catch {
    useProgress.getState().restoreOutbox(batch);
    return false;
  } finally {
    syncing = false;
  }
}
