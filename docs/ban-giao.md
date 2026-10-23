# Bàn giao dự án Dương Sinh Chess

Cập nhật: 23/10/2026. Toàn bộ mã đã được merge vào nhánh `main`.

## 1. Trạng thái hiện tại

| Hạng mục | Trạng thái |
|---|---|
| Lõi luật cờ, máy 6 cấp | Xong. 35 + 6 test đạt, perft chuẩn CPW. |
| Nội dung | 40 mini-game (6 cấp), 12 tàn cuộc, 10 ván kinh điển. 93 test tự giải bài đều đạt. |
| App (Expo SDK 58) | Đủ màn hình: Học, Chơi, Tàn cuộc, Phân tích, CLB, HLV, Lớp học, Cài đặt, mini-game tự tạo. |
| Web | Xuất được, Playwright 8/8 đạt trên Chromium. Đã kiểm thêm trên WebKit. |
| Desktop (Tauri 2) | Build và chạy thử gói `.deb` trên Linux. Windows/macOS build qua GitHub Actions khi đẩy tag `v*`. |
| Mobile | Bundle iOS/Android (Hermes) xuất được. **Chưa chạy trên máy thật.** |
| Supabase | Đã áp 3 migration, RLS/RPC đã kiểm với 3 tài khoản giả lập. |
| CI | `ci.yml` xanh trên GitHub. |

## 2. Việc Thầy cần làm trên dashboard (Claude không tự làm được)

1. Supabase → project `duongsinh-chess` → Authentication → Sign In / Providers → bật **Allow anonymous sign-ins**.
2. Authentication → Emails → Templates. Trong mẫu **Magic Link** và **Change Email Address**, thêm dòng `Mã xác nhận: {{ .Token }}`.
3. Authentication → Users: xóa 3 tài khoản test có id bắt đầu bằng `aaaaaaaa-0000-4000-8000-`. Nhóm, ván và tiến độ test sẽ tự xóa theo.
4. GitHub → Settings → Secrets and variables → Actions: thêm `EXPO_TOKEN` (tạo ở expo.dev → Access tokens) để workflow Mobile build được.
5. Phát hành bản desktop: `git tag v0.1.0` rồi `git push origin v0.1.0`.

## 3. Việc nên làm tiếp (theo thứ tự ưu tiên)

1. **Chạy thử trên điện thoại thật:** `pnpm dev` + Expo Go, hoặc `eas build -p android --profile preview` để có file APK. Kiểm kéo thả quân, âm thanh, màn hình nhỏ.
2. **Đưa bản web lên mạng** (Vercel hoặc Cloudflare Pages). Thư mục xuất là `apps/app/dist`, cần chuyển mọi đường dẫn về `index.html`.
3. **Mở rộng nội dung:**
   - Mini-game: Acorn có hơn 150 bài, mình mới có 40. Bổ sung theo giáo trình Dương Sinh và nguồn tiếng Nga đang Việt hóa.
   - Ván kinh điển: từ 10 ván lên vài chục. Chỉ dùng ván thuộc phạm vi công cộng, chú giải tự viết.
4. **Kiểm luật cờ phía server** cho ván online: Supabase Edge Function dùng `packages/chess-core`. Nên làm trước khi mở chơi công khai.
5. **Ký số bộ cài** (chứng chỉ Windows, Apple Developer) để tránh cảnh báo SmartScreen/Gatekeeper.
6. **Nộp store:** Google Play (`eas submit -p android`), App Store (cần tài khoản Apple Developer).

## 4. Chạy trên máy Thầy (Windows)

```powershell
cd D:\code
git clone https://github.com/covuaduongsinh/chessminigame.git   # hoặc: cd chessminigame; git pull
cd chessminigame
corepack enable
pnpm install
pnpm check
pnpm web
```

Chi tiết xem [huong-dan-chay.md](huong-dan-chay.md).

## 5. Lệnh mở đầu cho Claude Code trên máy local

Mở PowerShell tại `D:\code\chessminigame`, chạy `claude`, rồi dán:

```text
Đọc CLAUDE.md và docs/ban-giao.md để nắm dự án Dương Sinh Chess (Expo SDK 58 + Tauri 2 + Supabase, monorepo pnpm).
Bước 1: chạy `pnpm install` và `pnpm check`, báo kết quả. Nếu lỗi do môi trường Windows thì sửa cho chạy được.
Bước 2: chạy `pnpm web`, mở http://localhost:8081, chơi thử "Tìm ô" và "Tốt ăn sao" để xác nhận app chạy.
Bước 3: làm tiếp mục 3 trong docs/ban-giao.md theo thứ tự, mỗi mục một commit, chạy `pnpm check` trước mỗi commit.
Giữ đúng quy ước trong CLAUDE.md: không chép tài sản của Acorn Chess, đúng màu thương hiệu, bài mới phải qua test tự giải.
```
