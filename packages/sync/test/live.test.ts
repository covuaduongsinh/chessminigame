// Kiểm tra trên máy chủ Supabase thật (VPS). Chỉ chạy khi SUPABASE_LIVE=1, ví dụ:
//   SUPABASE_LIVE=1 pnpm --filter @duongsinh/sync test
// Tạo 3 tài khoản ẩn danh, chạy hết luồng CLB rồi tự xóa cả 3 tài khoản.
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  createGame,
  createGroup,
  createSyncClient,
  type DB,
  DEFAULT_SYNC_CONFIG,
  deleteMyAccount,
  ensureSession,
  type GameRow,
  type Group,
  groupMembers,
  groupProgress,
  joinGroup,
  joinGroupPresence,
  listGames,
  type MoveRow,
  type Profile,
  playMove,
  pullProgress,
  pushProgress,
  respondGame,
  subscribeGame,
} from '../src/index';

const LIVE = process.env.SUPABASE_LIVE === '1';
const url = process.env.SUPABASE_URL ?? DEFAULT_SYNC_CONFIG.url;
const key = process.env.SUPABASE_ANON_KEY ?? DEFAULT_SYNC_CONFIG.key;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Chờ tới khi callback được gọi, quá `ms` thì báo lỗi. */
function waitFor<T>(start: (done: (v: T) => void) => void, ms = 20_000): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('quá thời gian chờ')), ms);
    start((v) => {
      clearTimeout(timer);
      resolve(v);
    });
  });
}

describe.skipIf(!LIVE)(`Supabase thật: ${url}`, () => {
  const A: DB = createSyncClient({ url, key }); // chủ nhóm (HLV)
  const B: DB = createSyncClient({ url, key }); // học sinh trong nhóm
  const C: DB = createSyncClient({ url, key }); // người ngoài
  let a: Profile;
  let b: Profile;
  let c: Profile;
  let group: Group;
  let game: GameRow;

  beforeAll(async () => {
    [a, b, c] = await Promise.all([ensureSession(A), ensureSession(B), ensureSession(C)]);
  }, 30_000);

  afterAll(async () => {
    for (const db of [A, B, C]) {
      await db.removeAllChannels();
      // Tài khoản đã xóa trong test thì không còn phiên: bỏ qua lỗi.
      await deleteMyAccount(db).catch(() => {});
    }
  }, 30_000);

  it('đăng nhập ẩn danh và có tên tự sinh', () => {
    for (const p of [a, b, c]) expect(p.nickname.length).toBeGreaterThanOrEqual(2);
    expect(new Set([a.id, b.id, c.id]).size).toBe(3);
  });

  it('tạo nhóm, vào nhóm bằng mã (chữ thường cũng được)', async () => {
    group = await createGroup(A, 'Nhóm kiểm tra tự động');
    expect(group.join_code).toMatch(/^[A-Z2-9]{6}$/);
    await joinGroup(B, group.join_code.toLowerCase());
    const members = await groupMembers(A, group.id);
    expect(members.map((m) => m.user_id).sort()).toEqual([a.id, b.id].sort());
  });

  it('người ngoài không thấy thành viên, ván hay tiến độ của nhóm', async () => {
    expect(await groupMembers(C, group.id)).toEqual([]);
    expect(await listGames(C, group.id)).toEqual([]);
    expect(await pullProgress(C, b.id)).toEqual([]);
    await expect(groupProgress(C, group.id)).rejects.toThrow();
  });

  it('Presence: chủ nhóm thấy học sinh đang online', async () => {
    const stops: Array<() => void> = [];
    const online = await waitFor<string[]>((done) => {
      stops.push(joinGroupPresence(B, group.id, { id: b.id, nickname: b.nickname }, () => {}));
      stops.push(
        joinGroupPresence(A, group.id, { id: a.id, nickname: a.nickname }, (ids) => {
          if (ids.includes(b.id)) done(ids);
        }),
      );
    });
    expect(online).toContain(b.id);
    for (const stop of stops) stop();
  }, 30_000);

  it('ván online: mời, nhận lời, Realtime nhận nước đi, chặn đi sai lượt', async () => {
    game = await createGame(A, group.id, b.id, 'w');
    await expect(respondGame(A, game.id, true)).rejects.toThrow(/opponent must accept/);
    game = await respondGame(B, game.id, true);
    expect(game.status).toBe('active');

    let unsubscribe = () => {};
    const received = waitFor<MoveRow>((done) => {
      unsubscribe = subscribeGame(B, game.id, { onMove: done });
    });
    await sleep(2_000); // chờ kênh Realtime đăng ký xong
    await playMove(A, {
      gameId: game.id,
      ply: 1,
      uci: 'e2e4',
      san: 'e4',
      fenAfter: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1',
    });
    const move = await received;
    unsubscribe();
    expect(move.san).toBe('e4');

    await expect(
      playMove(A, {
        gameId: game.id,
        ply: 2,
        uci: 'd2d4',
        san: 'd4',
        fenAfter: 'rnbqkbnr/pppppppp/8/8/3PP3/8/PPP2PPP/RNBQKBNR b KQkq - 0 1',
      }),
    ).rejects.toThrow(/lượt/);
    const after = await playMove(B, {
      gameId: game.id,
      ply: 2,
      uci: 'e7e5',
      san: 'e5',
      fenAfter: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2',
    });
    expect(after.ply).toBe(2);
  }, 40_000);

  it('tiến độ gộp lấy thành tích tốt nhất; chỉ HLV xem được bảng sao', async () => {
    await pushProgress(B, [{ item_id: 'tot-1', stars: 2, moves: 5, attempts: 1 }]);
    const rows = await pushProgress(B, [{ item_id: 'tot-1', stars: 3, moves: 7, attempts: 1 }]);
    const row = rows.find((r) => r.item_id === 'tot-1');
    expect(row).toMatchObject({ best_stars: 3, best_moves: 5, attempts: 2 });

    await expect(groupProgress(B, group.id)).rejects.toThrow();
    const board = await groupProgress(A, group.id);
    expect(board.some((r) => r.user_id === b.id && r.item_id === 'tot-1')).toBe(true);
  });

  it('xóa tài khoản xóa luôn dữ liệu trên máy chủ', async () => {
    await deleteMyAccount(B);
    const members = await groupMembers(A, group.id);
    expect(members.map((m) => m.user_id)).toEqual([a.id]);
    const board = await groupProgress(A, group.id);
    expect(board.some((r) => r.user_id === b.id)).toBe(false);
    expect(await listGames(A, group.id)).toEqual([]);
  });
});
