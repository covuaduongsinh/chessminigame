import { describe, expect, it } from 'vitest';
import { buildCustomGame, type CustomConfig, MiniGameSession, parseCustomGame } from '../src';

const base: CustomConfig = {
  title: 'Xe ăn sao của thầy',
  fen: '8/8/8/8/8/8/8/R7 w - - 0 1',
  stars: ['a8', 'h8'],
  mode: 'collect',
  moveLimit: 0,
  engineLevel: 2,
  avoidAttacked: false,
  mustCapture: false,
  ordered: false,
};

describe('bài tự tạo', () => {
  it('ăn sao: tính par và chơi được', () => {
    const r = buildCustomGame('c1', base);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.par).toBe(2);
    const s = new MiniGameSession(r.def, { seed: 1 });
    s.playerMove('a1', 'a8');
    s.playerMove('a8', 'h8');
    expect(s.status).toBe('won');
  });
  it('báo lỗi khi không giải được hoặc thiếu sao', () => {
    expect(buildCustomGame('c2', { ...base, stars: [] }).ok).toBe(false);
    const blocked = buildCustomGame('c3', {
      ...base,
      fen: '8/8/8/8/8/8/8/B7 w - - 0 1',
      stars: ['a2'],
    });
    expect(blocked.ok).toBe(false);
    expect(buildCustomGame('c4', { ...base, moveLimit: 1 }).ok).toBe(false);
  });
  it('bắt quân, chiếu hết, đua Tốt', () => {
    expect(
      buildCustomGame('c5', { ...base, mode: 'capture', fen: '8/8/8/3p4/8/8/8/R7 w - - 0 1' }).ok,
    ).toBe(true);
    expect(
      buildCustomGame('c6', {
        ...base,
        mode: 'mate',
        fen: '4k3/8/4K3/8/8/8/8/7R w - - 0 1',
        moveLimit: 3,
      }).ok,
    ).toBe(true);
    expect(
      buildCustomGame('c7', { ...base, mode: 'mate', fen: '8/8/8/8/8/8/8/7R w - - 0 1' }).ok,
    ).toBe(false);
    expect(
      buildCustomGame('c8', { ...base, mode: 'race', fen: '8/pp6/8/8/8/8/PP6/8 w - - 0 1' }).ok,
    ).toBe(true);
  });
  it('kiểm tra dữ liệu tải về', () => {
    const r = buildCustomGame('c9', base);
    if (!r.ok) throw new Error();
    expect(parseCustomGame(JSON.parse(JSON.stringify(r.def)))).not.toBeNull();
    expect(
      parseCustomGame({ id: 'x', rounds: [{ mode: 'collect', fen: 'bad', targets: [] }] }),
    ).toBeNull();
    expect(parseCustomGame(null)).toBeNull();
  });
});
