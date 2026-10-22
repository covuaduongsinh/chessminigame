# Kiến trúc Dương Sinh Chess

## Tổng quan

```
             ┌──────────────── apps/app (Expo Router) ────────────────┐
             │  màn hình: Học · Chơi · Tàn cuộc · Phân tích · CLB      │
             │  HLV · Lớp học · Cài đặt · Mini-game tự tạo             │
             └───────┬───────────────┬───────────────┬────────────────┘
                     │ iOS/Android   │ Web           │ Desktop
                     │ (Hermes)      │ (react-native-web, SPA)
                     │               │               └─ apps/desktop (Tauri 2 bọc bản web)
                     ▼               ▼
  packages/ui ── Bàn cờ SVG, bộ quân, theme Dương Sinh
  packages/minigames ── nội dung + bộ chấm (MiniGameSession)
  packages/engine ── máy cờ 6 cấp
  packages/chess-core ── luật cờ, FEN/SAN/PGN
  packages/sync ── Supabase: tài khoản ẩn danh, tiến độ, nhóm, ván online, Presence
                     │
                     ▼
            Supabase (Postgres + RLS + RPC + Realtime)
```

Phụ thuộc chỉ đi một chiều: `chess-core` ← `engine` ← `minigames` ← `ui`/`app`. Ba package lõi là TypeScript thuần, không phụ thuộc React, nên chạy được trong test Node, trên web worker hay trên server nếu sau này cần.

## packages/chess-core

- Bàn cờ **0x88**, sinh nước giả hợp lệ rồi lọc nước để Vua bị chiếu. Có Zobrist hash 53 bit để phát hiện lặp thế và dùng làm khóa bảng chuyển vị cho máy.
- Hỗ trợ **thế không có Vua** cho mini-game, ví dụ chỉ có một con Mã và các ngôi sao. Khi đó không xét chiếu.
- SAN, PGN (bộ đọc tự viết: giữ chú thích, bỏ qua biến phụ và lấy nhánh chính), đủ các luật kết thúc: chiếu hết, hết nước, 50 nước, lặp 3 lần, thiếu quân.
- `explainIllegalMove(pos, from, to)` trả về lý do một nước không hợp lệ (14 loại). App dùng nó để giải thích cho trẻ bằng lời.
- Kiểm thử bằng **perft** theo các thế chuẩn của Chess Programming Wiki.

## packages/engine

- Negamax + alpha-beta, quiescence, bảng chuyển vị, killer/history heuristic, iterative deepening có giới hạn thời gian.
- **6 cấp** ứng với lộ trình. Mỗi cấp gồm: độ sâu, xác suất đi hớ, biên độ chấp nhận nước kém, top-K và nhiệt độ softmax khi chọn nước. Máy cấp thấp đi giống trẻ mới học chứ không đi ngẫu nhiên.
- `Objective`: mini-game truyền vào luật thắng thua và hàm đánh giá riêng. Ví dụ trong bài "đua phong cấp", máy chỉ quan tâm Tốt nào tiến xa hơn.
- `thinkAsync` nhường lượt cho giao diện vẽ xong rồi mới tính, kèm độ trễ tối thiểu để trẻ kịp nhìn nước của máy.

## packages/minigames

Mỗi mini-game là **dữ liệu**, không phải code:

```ts
{
  id: 'ma-7', level: 'ma', order: 7,
  title: { vi, en }, story: { vi, en }, goal: { vi, en }, lesson: { vi, en },
  rounds: [{ mode: 'collect', mustCapture: true, fen: '…', targets: [...] }],
  skills: ['knight', 'calculation'],
}
```

- 8 kiểu vòng chơi: `collect`, `race`, `stop`, `survive`, `mate`, `puzzle`, `quiz`, `play`.
- `MiniGameSession` là máy trạng thái chung cho mọi kiểu: nhận nước đi, trả về sự kiện (`collect`, `illegal`, `trap`, `round-won`, `won`, `lost`, …), tính sao.
- `solveCollect` (BFS) tính số nước tối thiểu để chấm 3 sao và để gợi ý.
- `buildCustomGame` dựng mini-game từ thế HLV xếp trên bàn và kiểm tra bài có giải được không trước khi lưu.
- **Test bắt buộc:** mọi bài có sẵn đều được giải tự động trong `content.test.ts` và `play.test.ts`. Riêng các bài đấu với máy, một máy mạnh đóng vai người chơi và phải thắng. Thêm bài mới mà không giải được thì CI báo đỏ.

### Thêm một mini-game

1. Mở file của cấp tương ứng trong `packages/minigames/src/content/` (`tot.ts`, `ma.ts`, …).
2. Thêm một object theo mẫu ở trên. `order` tăng dần.
3. Chạy `pnpm test`. Test sẽ tự giải bài và báo nếu bài sai.

## apps/app

- **Expo Router**, các route tiếng Việt không dấu (`/minigame/[id]`, `/tan-cuoc/[id]`, `/lop-hoc/[id]`, `/hlv/[id]`, …).
- **Zustand + AsyncStorage** lưu tiến độ, cài đặt và mini-game tự tạo ngay trên máy (localStorage khi chạy web).
- **Outbox**: mỗi lần chơi xong sinh một bản ghi tiến độ. Bản ghi được đẩy lên server khi có mạng, gộp theo quy tắc "lấy thành tích tốt nhất" (sao cao nhất, số nước ít nhất). Vì vậy dùng nhiều thiết bị không bao giờ làm mất sao.
- i18n tiếng Việt (mặc định) và tiếng Anh. Font Roboto. Âm thanh tự tổng hợp bằng `scripts/gen-sounds.mjs`.

## Supabase

Bảng: `profiles`, `groups`, `group_members`, `progress`, `games`, `moves`, `assignments`, `custom_games`.

- **Trẻ em đăng nhập ẩn danh**: không cần email, tên tự sinh. Phụ huynh hoặc HLV có thể gắn email (OTP) để dùng chung tài khoản trên thiết bị khác.
- **RLS ở mọi bảng**: chỉ thành viên trong nhóm mới thấy nhau; tiến độ của một em chỉ chính em và HLV của nhóm đọc được.
- **Mọi thao tác ghi quan trọng đi qua RPC** `security definer`: `create_group`, `join_group`, `sync_progress`, `create_game`, `respond_game`, `play_move`, `resign_game`. Client không ghi thẳng vào `games`/`moves`.
- Các hàm kiểm tra quyền nằm trong schema `private`, không gọi được qua REST.
- **Realtime** trên `games` và `moves` cho ván online. **Presence** theo kênh `presence:<groupId>` để hiện bạn đang online.
- `play_move` kiểm tra tư cách người chơi, lượt đi và thứ tự nước (ply). Tính hợp lệ của nước cờ do client kiểm bằng `chess-core`. Nếu sau này mở chơi công khai thì nên chuyển phần kiểm luật lên Edge Function.

## Desktop (Tauri 2)

`apps/desktop` không có giao diện riêng: Tauri nạp bản web đã xuất ở `apps/app/dist`. Cấu hình gồm:

- `single-instance`: mở app lần hai thì đưa cửa sổ cũ lên trước.
- `window-state`: nhớ kích thước và vị trí cửa sổ, tiện khi dùng với máy chiếu.
- CSP chặt, chỉ cho kết nối tới Supabase và Lichess.

## Kiểm thử

| Tầng | Công cụ | Nội dung |
|---|---|---|
| Luật cờ | Vitest | perft chuẩn, FEN/SAN/PGN, kết thúc ván, giải thích nước sai |
| Máy | Vitest | nước trả về hợp lệ ở mọi cấp, tìm được chiếu hết |
| Nội dung | Vitest | mọi mini-game và tàn cuộc đều giải được |
| Giao diện | Playwright | 8 kịch bản trên bản web: chạm-chạm, kéo thả, thắng 3 sao, lưu tiến độ, câu hỏi, chơi với máy, PGN, lớp học |
| Database | SQL qua Supabase | RLS và RPC với 3 tài khoản giả lập (chủ nhóm, thành viên, người ngoài) |
