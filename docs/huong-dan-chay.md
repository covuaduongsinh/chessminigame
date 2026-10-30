# Hướng dẫn chạy và build

Các lệnh dưới đây viết cho **Windows (PowerShell)**, giả sử mã nguồn đặt tại `D:\code\chessminigame`. Trên macOS/Linux dùng y nguyên các lệnh `pnpm`.

## 1. Chuẩn bị máy (làm một lần)

```powershell
winget install OpenJS.NodeJS.LTS      # Node.js 22 trở lên
winget install Git.Git
corepack enable                        # bật pnpm đúng phiên bản (10.28) ghi trong package.json
```

Lấy mã nguồn:

```powershell
cd D:\code
git clone https://github.com/covuaduongsinh/chessminigame.git
cd chessminigame
pnpm install
```

## 2. Chạy bản Web

```powershell
pnpm web
```

Mở trình duyệt tại <http://localhost:8081>. Sửa code thì trang tự tải lại.

Xuất bản web tĩnh để đưa lên hosting (Vercel, Netlify, Cloudflare Pages, …):

```powershell
pnpm build:web                 # kết quả nằm ở apps\app\dist
node scripts\serve-dist.mjs apps\app\dist 8081   # xem thử bản đã xuất
```

Lưu ý: app là SPA, nên hosting cần chuyển mọi đường dẫn về `index.html`.

## 3. Thử trên điện thoại bằng Expo Go

```powershell
pnpm dev
```

Cài **Expo Go** (bản hỗ trợ SDK 58) trên điện thoại, quét mã QR hiện trong cửa sổ lệnh. Điện thoại và máy tính phải dùng chung Wi-Fi. Nếu mạng trường/công ty chặn, chạy `pnpm --filter @duongsinh/app start --tunnel`.

## 4. App Desktop (Tauri 2)

Cài thêm (một lần):

```powershell
winget install Rustlang.Rustup
winget install Microsoft.VisualStudio.2022.BuildTools --override "--add Microsoft.VisualStudio.Workload.VCTools --includeRecommended --passive"
```

WebView2 có sẵn trên Windows 10/11. Bộ cài cũng tự tải WebView2 nếu máy thiếu.

```powershell
pnpm desktop:dev      # mở cửa sổ desktop, tự tải lại khi sửa code
pnpm desktop:build    # tạo bộ cài
```

Bộ cài nằm ở `apps\desktop\src-tauri\target\release\bundle\nsis\Dương Sinh Chess_0.1.0_x64-setup.exe` (tên file đổi theo phiên bản). Bản Windows chỉ build bộ cài NSIS (`.exe`) vì bộ cài MSI (WiX) không chấp nhận tên có dấu tiếng Việt.

Trên Linux, gói `.deb` dùng tên không dấu `duong-sinh-chess` (quy định của dpkg), còn tên hiện trong menu ứng dụng vẫn là "Dương Sinh Chess".

Bộ cài macOS (`.dmg`) phải build trên máy Mac. Không có Mac thì dùng GitHub Actions (mục 8).

Đổi icon: sửa `scripts\gen-icons.mjs`, chạy `node scripts\gen-icons.mjs`, rồi `pnpm --filter @duongsinh/desktop icons`.

## 5. App Mobile (iOS / Android) bằng EAS

```powershell
npm install -g eas-cli
eas login                       # tài khoản expo.dev (miễn phí)
cd apps\app
eas init                        # gắn app với project trên expo.dev (chỉ lần đầu)
eas build -p android --profile preview      # ra file .apk để cài thẳng lên máy Android
eas build -p android --profile production   # ra .aab để nộp Google Play
eas build -p ios --profile production       # cần tài khoản Apple Developer (99 USD/năm)
eas submit -p android                        # nộp lên Google Play
```

Mã ứng dụng (bundle id) hiện là `vn.duongsinh.chess`. Có thể đổi trong `apps\app\app.json` trước khi nộp store lần đầu.

## 6. Biến môi trường

App đã có sẵn địa chỉ và khóa anon (công khai) của Supabase tự cài trên VPS `https://supabasechessminigame.dsc.edu.vn`, dành riêng cho Dương Sinh Chess. Muốn trỏ sang máy chủ khác (ví dụ Supabase chạy thử trên máy), tạo file `apps\app\.env.local`:

```ini
EXPO_PUBLIC_SUPABASE_URL=https://<địa chỉ máy chủ>
EXPO_PUBLIC_SUPABASE_KEY=<ANON_KEY>
# Tắt hẳn đồng bộ (app chạy offline hoàn toàn):
# EXPO_PUBLIC_SYNC=off
```

Chỉ dùng khóa **anon** (công khai). Không bao giờ đưa `SERVICE_ROLE_KEY` hay `JWT_SECRET` vào app.

## 7. Supabase trên VPS

- Cấu hình máy chủ (khóa, đăng nhập ẩn danh, SMTP Gmail, mẫu email, sao lưu): xem [ke-hoach-supabase-vps.md](ke-hoach-supabase-vps.md).
- **Schema tự áp:** sửa hoặc thêm file trong `supabase\migrations` rồi push lên `main` → workflow *Database (Supabase VPS)* áp lên VPS (cần secret `SUPABASE_DB_URL`) → workflow *Kiểm tra Supabase VPS* chạy luồng CLB trên máy chủ thật.
- Chạy kiểm tra máy chủ thật từ máy Thầy: `$env:SUPABASE_LIVE="1"; pnpm --filter @duongsinh/sync test`.

## 8. GitHub Actions

| Workflow | Khi nào chạy | Làm gì |
|---|---|---|
| `ci.yml` | Mỗi lần push/PR | Lint, typecheck, unit test, xuất bản web, chạy e2e Playwright |
| `desktop.yml` | Khi đẩy tag `v*` hoặc bấm tay | Build bộ cài Windows, macOS (Apple Silicon + Intel), Linux; tạo bản nháp Release |
| `mobile.yml` | Bấm tay (Actions → Mobile (EAS) → Run workflow) | Gửi lệnh build iOS/Android lên EAS. Cần secret `EXPO_TOKEN` |
| `pages.yml` | Mỗi lần push lên `main` | Xuất bản web và đăng lên GitHub Pages: https://covuaduongsinh.github.io/chessminigame/ |
| `publish-release.yml` | Bấm tay | Chuyển bản nháp Release desktop thành bản chính thức |
| `db-migrate.yml` | Push `main` có đổi `supabase/migrations`, hoặc bấm tay | Áp schema lên Supabase VPS (secret `SUPABASE_DB_URL`) |
| `supabase-smoke.yml` | Sau `db-migrate`, hoặc bấm tay | Chạy luồng CLB trên máy chủ thật rồi tự dọn tài khoản test |

Phát hành bản desktop:

```powershell
git tag v0.1.0
git push origin v0.1.0
```

Sau khoảng 15–20 phút, bộ cài xuất hiện ở mục **Releases** dưới dạng bản nháp. Kiểm tra rồi bấm Publish.

Bộ cài chưa ký số (code signing) nên Windows SmartScreen và macOS Gatekeeper sẽ cảnh báo khi mở. Muốn bỏ cảnh báo thì cần mua chứng chỉ ký số Windows và đăng ký Apple Developer, rồi thêm vào secrets của workflow theo hướng dẫn của Tauri.

## 9. Kiểm thử

```powershell
pnpm check                                  # lint + typecheck + unit test
pnpm build:web
pnpm --filter @duongsinh/app exec playwright install chromium   # lần đầu
pnpm --filter @duongsinh/app e2e            # 8 kịch bản e2e trên bản web
```
