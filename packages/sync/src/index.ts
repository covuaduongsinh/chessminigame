import {
  createClient,
  type RealtimeChannel,
  type SupabaseClient,
  type SupportedStorage,
} from '@supabase/supabase-js';
import type { Database, Enums, Tables } from './database.types';

export type { Database, Enums, Tables };
export type DB = SupabaseClient<Database>;
export type Profile = Tables<'profiles'>;
export type Group = Tables<'groups'>;
export type GameRow = Tables<'games'>;
export type MoveRow = Tables<'moves'>;
export type ProgressRow = Tables<'progress'>;
export type Assignment = Tables<'assignments'>;
export type MemberRole = Enums<'member_role'>;
export type GroupKind = Enums<'group_kind'>;

/** Project Supabase của Dương Sinh (khóa publishable dùng công khai được, dữ liệu được bảo vệ bằng RLS). */
export const DEFAULT_SYNC_CONFIG = {
  url: 'https://agsydzfefbawezpunxwd.supabase.co',
  key: 'sb_publishable_uLTSoRIzEiD_0t0sg2UhdQ_gHJqEe0Q',
} as const;

export interface SyncConfig {
  url: string;
  key: string;
  storage?: SupportedStorage;
  /** true trên web để nhận phiên từ link email. */
  detectSessionInUrl?: boolean;
}

export function createSyncClient(cfg: SyncConfig): DB {
  return createClient<Database>(cfg.url, cfg.key, {
    auth: {
      storage: cfg.storage,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: cfg.detectSessionInUrl ?? false,
    },
    realtime: { params: { eventsPerSecond: 10 } },
  });
}

// ---------------------------------------------------------------- tên tự sinh

const PIECE_NAMES = ['Tốt', 'Mã', 'Tượng', 'Xe', 'Hậu', 'Vua'];
const ADJECTIVES = [
  'Xanh',
  'Vàng',
  'Cam',
  'Ngọc',
  'Bạc',
  'Nhanh Nhẹn',
  'Dũng Cảm',
  'Thông Minh',
  'Vui Vẻ',
  'Tí Hon',
  'Tinh Nhanh',
  'Kiên Nhẫn',
];
export const AVATARS = ['p', 'n', 'b', 'r', 'q', 'k'] as const;

/** Tên hiển thị ngẫu nhiên, không chứa thông tin cá nhân (ví dụ "Mã Xanh 27"). */
export function randomNickname(rng: () => number = Math.random): {
  nickname: string;
  avatar: string;
} {
  const pi = Math.floor(rng() * PIECE_NAMES.length);
  const adj = ADJECTIVES[Math.floor(rng() * ADJECTIVES.length)]!;
  const num = 10 + Math.floor(rng() * 90);
  return { nickname: `${PIECE_NAMES[pi]} ${adj} ${num}`, avatar: AVATARS[pi]! };
}

// ---------------------------------------------------------------------- lỗi

export class SyncError extends Error {
  constructor(
    message: string,
    readonly code?: string,
  ) {
    super(message);
    this.name = 'SyncError';
  }
}

const FRIENDLY: Array<[RegExp, string]> = [
  [/group not found/i, 'Không tìm thấy nhóm với mã này.'],
  [/not your turn/i, 'Chưa tới lượt em.'],
  [/not a member/i, 'Em chưa ở trong nhóm này.'],
  [/coach only/i, 'Chỉ HLV của nhóm mới xem được.'],
  [/anonymous sign-ins are disabled/i, 'Máy chủ chưa bật đăng nhập ẩn danh.'],
  [/fetch|network/i, 'Không có kết nối mạng. Thử lại sau nhé.'],
];

function fail(error: { message: string; code?: string } | null): never {
  const msg = error?.message ?? 'Lỗi không xác định';
  const friendly = FRIENDLY.find(([re]) => re.test(msg))?.[1];
  throw new SyncError(friendly ?? msg, error?.code);
}

function must<T>(res: {
  data: T;
  error: { message: string; code?: string } | null;
}): NonNullable<T> {
  if (res.error) fail(res.error);
  return res.data as NonNullable<T>;
}

// ------------------------------------------------------------------ tài khoản

/** Đăng nhập ẩn danh (nếu chưa có phiên) và bảo đảm có hồ sơ. */
export async function ensureSession(
  db: DB,
  preferred?: { nickname: string; avatar: string },
): Promise<Profile> {
  const { data } = await db.auth.getSession();
  if (!data.session) {
    const res = await db.auth.signInAnonymously();
    if (res.error) fail(res.error);
  }
  const name = preferred ?? randomNickname();
  return must(await db.rpc('ensure_profile', { p_nickname: name.nickname, p_avatar: name.avatar }));
}

export async function updateProfile(
  db: DB,
  patch: { nickname?: string; avatar?: string; role?: Enums<'user_role'> },
): Promise<Profile> {
  return must(
    await db.rpc('update_profile', {
      p_nickname: patch.nickname,
      p_avatar: patch.avatar,
      p_role: patch.role,
    }),
  );
}

/** Liên kết tài khoản ẩn danh với email phụ huynh/HLV (Supabase gửi email xác nhận). */
export async function linkEmail(db: DB, email: string): Promise<void> {
  const res = await db.auth.updateUser({ email });
  if (res.error) fail(res.error);
}

/** Đăng nhập bằng mã OTP gửi qua email (dùng trên thiết bị mới). */
export async function sendEmailOtp(db: DB, email: string): Promise<void> {
  const res = await db.auth.signInWithOtp({ email, options: { shouldCreateUser: true } });
  if (res.error) fail(res.error);
}

export async function verifyEmailOtp(
  db: DB,
  email: string,
  token: string,
  type: 'email' | 'email_change' = 'email',
): Promise<void> {
  const res = await db.auth.verifyOtp({ email, token, type });
  if (res.error) fail(res.error);
}

// -------------------------------------------------------------------- tiến độ

export interface ProgressDelta {
  item_id: string;
  stars: number;
  moves: number | null;
  attempts: number;
}

/** Đẩy tiến độ lên máy chủ (máy chủ gộp: lấy thành tích tốt nhất, cộng dồn số lần chơi). */
export async function pushProgress(db: DB, items: ProgressDelta[]): Promise<ProgressRow[]> {
  if (items.length === 0) return [];
  return must(
    await db.rpc('sync_progress', {
      p_items:
        items as unknown as Database['public']['Functions']['sync_progress']['Args']['p_items'],
    }),
  );
}

export async function pullProgress(db: DB, userId: string): Promise<ProgressRow[]> {
  return must(await db.from('progress').select('*').eq('user_id', userId));
}

// ----------------------------------------------------------------------- nhóm

export interface MyGroup extends Group {
  myRole: MemberRole;
}

export async function myGroups(db: DB, userId: string): Promise<MyGroup[]> {
  const rows = must(
    await db
      .from('group_members')
      .select('role, groups(*)')
      .eq('user_id', userId)
      .order('joined_at'),
  );
  return rows.flatMap((r) => (r.groups ? [{ ...(r.groups as Group), myRole: r.role }] : []));
}

export async function createGroup(db: DB, name: string, kind: GroupKind = 'club'): Promise<Group> {
  return must(await db.rpc('create_group', { p_name: name, p_kind: kind }));
}

export async function joinGroup(db: DB, code: string): Promise<Group> {
  return must(await db.rpc('join_group', { p_code: code.trim().toUpperCase() }));
}

export interface Member {
  user_id: string;
  role: MemberRole;
  nickname: string;
  avatar: string;
}

export async function groupMembers(db: DB, groupId: string): Promise<Member[]> {
  const rows = must(
    await db
      .from('group_members')
      .select('user_id, role, profiles(nickname, avatar)')
      .eq('group_id', groupId),
  );
  return rows.map((r) => {
    const p = r.profiles as { nickname: string; avatar: string } | null;
    return {
      user_id: r.user_id,
      role: r.role,
      nickname: p?.nickname ?? '?',
      avatar: p?.avatar ?? 'p',
    };
  });
}

export async function leaveGroup(db: DB, groupId: string, userId: string): Promise<void> {
  must(await db.from('group_members').delete().eq('group_id', groupId).eq('user_id', userId));
}

export async function setMemberRole(
  db: DB,
  groupId: string,
  userId: string,
  role: MemberRole,
): Promise<void> {
  must(await db.rpc('set_member_role', { p_group: groupId, p_user: userId, p_role: role }));
}

export type GroupProgressRow = Database['public']['Functions']['group_progress']['Returns'][number];

export async function groupProgress(db: DB, groupId: string): Promise<GroupProgressRow[]> {
  return must(await db.rpc('group_progress', { p_group: groupId }));
}

export async function listAssignments(db: DB, groupId: string): Promise<Assignment[]> {
  return must(
    await db
      .from('assignments')
      .select('*')
      .eq('group_id', groupId)
      .order('created_at', { ascending: false }),
  );
}

export async function createAssignment(
  db: DB,
  a: {
    group_id: string;
    title: string;
    item_ids: string[];
    due_at?: string | null;
    created_by: string;
  },
): Promise<Assignment> {
  return must(await db.from('assignments').insert(a).select().single());
}

export async function deleteAssignment(db: DB, id: string): Promise<void> {
  must(await db.from('assignments').delete().eq('id', id));
}

// -------------------------------------------------------------------- ván online

export async function listGames(db: DB, groupId: string): Promise<GameRow[]> {
  return must(
    await db
      .from('games')
      .select('*')
      .eq('group_id', groupId)
      .order('updated_at', { ascending: false })
      .limit(30),
  );
}

export async function getGame(
  db: DB,
  gameId: string,
): Promise<{ game: GameRow; moves: MoveRow[] }> {
  const game = must(await db.from('games').select('*').eq('id', gameId).single());
  const moves = must(await db.from('moves').select('*').eq('game_id', gameId).order('ply'));
  return { game, moves };
}

export async function createGame(
  db: DB,
  groupId: string,
  opponentId: string,
  myColor: 'w' | 'b',
): Promise<GameRow> {
  return must(
    await db.rpc('create_game', { p_group: groupId, p_opponent: opponentId, p_my_color: myColor }),
  );
}

export async function respondGame(db: DB, gameId: string, accept: boolean): Promise<GameRow> {
  return must(await db.rpc('respond_game', { p_game: gameId, p_accept: accept }));
}

export async function playMove(
  db: DB,
  m: {
    gameId: string;
    ply: number;
    uci: string;
    san: string;
    fenAfter: string;
    result?: string | null;
  },
): Promise<GameRow> {
  return must(
    await db.rpc('play_move', {
      p_game: m.gameId,
      p_ply: m.ply,
      p_uci: m.uci,
      p_san: m.san,
      p_fen_after: m.fenAfter,
      p_result: m.result ?? undefined,
    }),
  );
}

export async function resignGame(db: DB, gameId: string): Promise<GameRow> {
  return must(await db.rpc('resign_game', { p_game: gameId }));
}

/** Theo dõi một ván theo thời gian thực. Trả về hàm hủy đăng ký. */
export function subscribeGame(
  db: DB,
  gameId: string,
  handlers: { onMove?: (m: MoveRow) => void; onGame?: (g: GameRow) => void },
): () => void {
  const channel: RealtimeChannel = db
    .channel(`game:${gameId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'moves', filter: `game_id=eq.${gameId}` },
      (payload) => handlers.onMove?.(payload.new as MoveRow),
    )
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'games', filter: `id=eq.${gameId}` },
      (payload) => handlers.onGame?.(payload.new as GameRow),
    )
    .subscribe();
  return () => {
    void db.removeChannel(channel);
  };
}

/** Theo dõi lời mời/ván mới trong nhóm. */
export function subscribeGroupGames(
  db: DB,
  groupId: string,
  onChange: (g: GameRow) => void,
): () => void {
  const channel = db
    .channel(`group-games:${groupId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'games', filter: `group_id=eq.${groupId}` },
      (payload) => {
        if (payload.new && 'id' in payload.new) onChange(payload.new as GameRow);
      },
    )
    .subscribe();
  return () => {
    void db.removeChannel(channel);
  };
}

/** Gộp tiến độ: lấy số sao cao nhất và số nước ít nhất. */
export function mergeBest(
  a: { stars: number; moves: number | null } | undefined,
  b: { stars: number; moves: number | null } | undefined,
): { stars: number; moves: number | null } {
  if (!a) return b ?? { stars: 0, moves: null };
  if (!b) return a;
  const moves =
    a.moves === null ? b.moves : b.moves === null ? a.moves : Math.min(a.moves, b.moves);
  return { stars: Math.max(a.stars, b.stars), moves };
}
