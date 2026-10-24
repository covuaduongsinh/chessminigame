# Bàn giao dự án Dương Sinh Chess

Cập nhật: 23/10/2026. Toàn bộ mã đã được merge vào nhánh `main`.

## 1. Trạng thái hiện tại

| Hạng mục | Trạng thái |
|---|---|
| Lõi luật cờ, máy 6 cấp | Xong. 35 + 6 test đạt, perft chuẩn CPW. |
| Nội dung | 52 mini-game (6 cấp), 12 tàn cuộc, 15 ván kinh điển. 132 test tự giải bài đều đạt. |
| App (Expo SDK 58) | Đủ màn hình: Học, Chơi, Tàn cuộc, Phân tích, CLB, HLV, Lớp học, Cài đặt, mini-game tự tạo. |
| Web | Tự triển khai lên GitHub Pages mỗi lần push `main`: <https://covuaduongsinh.github.io/chessminigame/>. Playwright 8/8 đạt, đã kiểm thêm trên WebKit. |
| Desktop (Tauri 2) | Bộ cài Windows, macOS (Apple Silicon + Intel), Linux đã phát hành ở [Release v0.1.0](https://github.com/covuaduongsinh/chessminigame/releases). Chưa ký số nên Windows/macOS sẽ cảnh báo khi mở lần đầu. |
| Mobile | Bundle iOS/Android (Hermes) xuất được. **Chưa chạy trên máy thật.** |
| Supabase | Đã áp 3 migration, RLS/RPC đã kiểm với 3 tài khoản giả lập. |
| CI | `ci.yml` xanh trên GitHub. |

## 2. Việc Thầy cần làm trên dashboard (Claude không tự làm được)

> **Đang chuyển Supabase sang VPS `https://supabase.dsc.edu.vn`.** Kế hoạch chi tiết ở [ke-hoach-supabase-vps.md](ke-hoach-supabase-vps.md). Các mục 3–5 dưới đây (dành cho Supabase Cloud) không cần làm nữa; Cloud sẽ bị xóa sau khi VPS chạy ổn.

1. **Ra bản desktop mới:** Actions → *Desktop (Tauri)* → Run workflow, nhập phiên bản (ví dụ `v0.1.1`, nhớ tăng `version` trong `apps/desktop/src-tauri/tauri.conf.json`) → chờ xong thì Actions → *Phát hành bản desktop* → Run workflow với cùng phiên bản. Nhập lại phiên bản chưa phát hành thì bản nháp cũ tự được thay.
2. **Web** đã tự động: mỗi lần push `main`, workflow *Web (GitHub Pages)* build và cập nhật <https://covuaduongsinh.github.io/chessminigame/>. Nếu sau này muốn tên miền riêng (ví dụ `hoc.covuaduongsinh.vn`), vào Settings → Pages → Custom domain. Muốn dùng Vercel thay thế thì `vercel.json` đã có sẵn, chỉ cần Import repo trên vercel.com.
3. Supabase → project `duongsinh-chess` → Authentication → Sign In / Providers → bật **Allow anonymous sign-ins**.
4. Authentication → Emails → Templates. Trong mẫu **Magic Link** và **Change Email Address**, thêm dòng `Mã xác nhận: {{ .Token }}`.
5. Authentication → Users: xóa 3 tài khoản test có id bắt đầu bằng `aaaaaaaa-0000-4000-8000-`. Nhóm, ván và tiến độ test sẽ tự xóa theo. Lệnh xóa từ Claude bị treo vì chờ xác nhận.
6. GitHub → Settings → Secrets and variables → Actions: thêm `EXPO_TOKEN` (tạo ở expo.dev → Access tokens) để workflow Mobile build được.

## 3. Việc nên làm tiếp (theo thứ tự ưu tiên)

1. **Chạy thử trên điện thoại thật:** `pnpm dev` + Expo Go, hoặc `eas build -p android --profile preview` để có file APK. Kiểm kéo thả quân, âm thanh, màn hình nhỏ.
2. **Kiểm tra bản web** trên điện thoại và máy tính bảng tại <https://covuaduongsinh.github.io/chessminigame/>.
3. **Mở rộng nội dung:**
   - Mini-game: Acorn có hơn 150 bài, mình có 52. Bổ sung theo giáo trình Dương Sinh và nguồn tiếng Nga đang Việt hóa.
   - Ván kinh điển: hiện có 15 ván, nên lên vài chục. Chú giải phải tự viết. Nước đi của 4 ván mới (Rotlewi–Rubinstein 1907, Fischer–Spassky 1972 ván 6, Deep Blue–Kasparov 1997 ván 6, Kasparov–Topalov 1999) đã được đối chiếu chéo, nhưng Thầy nên soát lại lời bình.
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
