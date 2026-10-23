# Dương Sinh Chess — Vui trí tuệ

Ứng dụng học cờ vua cho trẻ em của **Công ty CP Cờ vua Dương Sinh**. Một mã nguồn chạy trên **Web, Desktop (Windows / macOS / Linux) và Mobile (iOS / Android)**, tiến độ học đồng bộ giữa các thiết bị.

Lộ trình 6 cấp: **Tốt → Mã → Tượng → Xe → Hậu → Vua**.

## Có gì trong app

| Khu vực | Nội dung |
|---|---|
| **Học** | 40 mini-game theo 6 cấp, mở khóa dần, chấm 1–3 sao. 8 kiểu luật: ăn sao (có biến thể "ăn liên hoàn"), chặn Tốt, đua phong cấp, sống sót, chiếu hết, giải thế, câu hỏi nhìn bàn cờ, đấu với máy. Đi sai thì app giải thích lý do (14 trường hợp, ví dụ "Tốt không đi lùi", "Quân đang bị ghim"). |
| **Chơi** | Chơi với máy theo 6 cấp, từ "Máy Tốt" (hay đi hớ) tới "Máy Vua". Có gợi ý, đi lại và lật bàn. |
| **Tàn cuộc** | 12 thế tàn cuộc cơ bản (KQ–K, KR–K, KP–K, …), có máy đóng vai bên phòng thủ. |
| **Phân tích** | Bàn xếp thế, vẽ mũi tên và tô ô, nhập PGN (dán, mở file hoặc lấy từ Lichess), 10 ván kinh điển có chú giải tiếng Việt. HLV tự tạo mini-game ngay trên bàn: đặt sao, chọn luật, app tự kiểm tra bài có giải được không. |
| **CLB** | Nhóm riêng, vào bằng mã 6 ký tự hoặc QR. Tên tự sinh (ví dụ "Mã Xanh 27") nên trẻ không cần khai tên thật hay email. Chơi online theo thời gian thực với bạn trong nhóm, có chấm xanh cho bạn đang online. Không có chat, không quảng cáo. |
| **HLV / Phụ huynh** | Tạo lớp, xem bảng sao của từng em, giao bài (bài có sẵn hoặc bài tự tạo), mở **Lớp học**: bàn cờ lớn cho máy chiếu/bảng tương tác, điều khiển bằng phím ← → F D R. |
| **Offline** | Học, chơi với máy, tàn cuộc và phân tích chạy không cần mạng. Tiến độ được lưu trên máy và tự đẩy lên server khi có mạng. |

## Công nghệ

- **Expo SDK 58** (React Native 0.88, React 19.3, New Architecture, Expo Router) cho iOS, Android và Web.
- **Tauri 2** bọc bản web thành app desktop nhẹ (gói cài Linux chỉ khoảng 4 MB).
- **Supabase**: đăng nhập ẩn danh cho trẻ, email OTP cho HLV/phụ huynh, Postgres với RLS, Realtime cho ván online.
- **TypeScript strict**, pnpm workspaces, Turborepo, Biome, Vitest, Playwright.
- Máy cờ và bộ sinh nước đi viết riêng bằng TypeScript (`packages/chess-core`, `packages/engine`), đã kiểm bằng perft chuẩn.

Chi tiết: [docs/kien-truc.md](docs/kien-truc.md).

## Chạy nhanh

Cần **Node.js 22+** và **pnpm 10** (`corepack enable`).

```bash
pnpm install
pnpm web          # mở http://localhost:8081
pnpm dev          # quét QR bằng Expo Go trên điện thoại
pnpm check        # lint + typecheck + test
```

Hướng dẫn đầy đủ cho Windows, gồm build desktop và mobile: [docs/huong-dan-chay.md](docs/huong-dan-chay.md).

Trạng thái dự án, việc cần làm tiếp và lệnh bàn giao cho Claude Code: [docs/ban-giao.md](docs/ban-giao.md).

## Cấu trúc thư mục

```
apps/
  app/          Expo Router: iOS, Android, Web
  desktop/      Tauri 2: Windows, macOS, Linux
packages/
  chess-core/   Luật cờ, FEN/SAN/PGN, thế không có Vua cho mini-game, giải thích nước sai
  engine/       Máy cờ cho trẻ (6 cấp)
  minigames/    Nội dung bài học, bộ chấm, tàn cuộc, ván kinh điển, mini-game tự tạo
  ui/           Bàn cờ, bộ quân SVG, màu thương hiệu Dương Sinh
  sync/         Đồng bộ Supabase
supabase/migrations/   Schema, RLS, RPC
docs/                  Kiến trúc, hướng dẫn chạy, kết quả phân tích Acorn Chess bằng REA
```

## Nguồn gốc nội dung

Tính năng được tham khảo từ việc phân tích Acorn Chess bằng công cụ REA ([docs/research/acorn-feature-map.md](docs/research/acorn-feature-map.md)). Toàn bộ mã, hình quân cờ, âm thanh, câu chữ và tên bài học trong repo này đều do Dương Sinh tự làm, không sao chép của Acorn Chess.

## Giấy phép

MIT. Xem [LICENSE](LICENSE).
