# Kế hoạch chuyển sang Supabase tự cài trên VPS

Địa chỉ mới: **https://supabase.dsc.edu.vn**. Lập ngày 24/10/2026. Instance này **chỉ dùng cho Dương Sinh Chess**.

## Đã chốt

| Vấn đề | Quyết định |
|---|---|
| Áp schema lên database | GitHub Actions **kết nối thẳng Postgres** qua secret `SUPABASE_DB_URL` |
| Supabase Cloud (`duongsinh-chess`) | **Xóa hẳn** sau khi VPS chạy ổn. Cloud chỉ có dữ liệu test nên không phải chuyển dữ liệu. |
| Email gửi mã OTP | **Google Workspace/Gmail** (SMTP + App Password) |
| Bản web | **Giữ GitHub Pages**. Có thể gắn tên miền riêng, ví dụ `chess.dsc.edu.vn`. |
| Phạm vi | **Supabase trên VPS chỉ dành riêng cho Dương Sinh Chess.** Không chạy chung với dự án khác. |

## Vì sao phải làm theo thứ tự

- Máy Claude trên mây **không kết nối được** tới `supabase.dsc.edu.vn`, vì proxy chặn. Mọi thao tác và kiểm tra trên VPS đều chạy qua **GitHub Actions** (runner có Internet) hoặc trên máy Thầy.
- Công cụ Supabase MCP chỉ quản lý được project trên Cloud, không quản lý được VPS.
- Bản web và bộ cài desktop v0.1.0 đang trỏ tới Cloud. Phải chuyển xong và kiểm tra trên VPS rồi mới xóa Cloud.

---

## Giai đoạn 0 — Thầy chuẩn bị VPS (khoảng 45 phút)

### 0.0 Dành riêng cho dự án này

Toàn bộ instance (database, tài khoản người dùng, khóa API, email gửi đi) chỉ phục vụ Dương Sinh Chess. Vì vậy:

- **Không tạo bảng hay schema của dự án khác** trong database này. Schema `public` và `private` là của app cờ; bảng `auth.users` chỉ chứa học sinh, HLV và phụ huynh của Dương Sinh. Dự án khác nếu cần Supabase thì cài một instance riêng, có `.env`, khóa và database riêng.
- **Cấu hình Auth chỉnh thẳng theo app**, không phải dung hòa với ai: `SITE_URL` trỏ về app cờ, bật đăng nhập ẩn danh cho trẻ, email gửi đi mang tên "Cờ vua Dương Sinh".
- **Khóa và mật khẩu chỉ dùng cho dự án này.** `SUPABASE_DB_URL` trên GitHub chỉ mở được database của app cờ; lộ khóa thì không ảnh hưởng hệ thống khác.
- **Sao lưu và khôi phục theo nguyên instance.** `pg_dump` cả database chính là sao lưu toàn bộ app; khôi phục không sợ đè dữ liệu của dự án khác.
- **Tắt dịch vụ app không dùng để tiết kiệm RAM VPS** (tùy chọn): app không lưu file nên có thể tắt `storage` và `imgproxy`; `functions` để tắt cho tới giai đoạn 4 (kiểm luật cờ phía server). Nếu tắt, xóa luôn route tương ứng trong `volumes/api/kong.yml` rồi `docker compose up -d`.
- Tên miền `supabase.dsc.edu.vn` dùng được. Nếu muốn tên thể hiện rõ là của app cờ, có thể đổi sang ví dụ `api-chess.dsc.edu.vn`; báo Claude trước khi Giai đoạn 1 để em ghi đúng địa chỉ vào app.

### 0.1 Kiểm tra bảo mật (bắt buộc)

Bản Supabase tự cài đi kèm **khóa mẫu công khai trên mạng**. Mở file `.env` trong thư mục `supabase/docker` trên VPS và kiểm tra:

- `JWT_SECRET`, `ANON_KEY`, `SERVICE_ROLE_KEY` **không** phải giá trị mẫu trong `.env.example`. Nếu còn khóa mẫu thì ai cũng có thể vào với quyền quản trị. Tạo khóa mới theo hướng dẫn "Generate API keys" trong tài liệu self-hosting của Supabase.
- `POSTGRES_PASSWORD` dài ít nhất 32 ký tự ngẫu nhiên.
- `DASHBOARD_USERNAME` và `DASHBOARD_PASSWORD` đã đổi. Nên giới hạn IP được vào Studio.
- `SECRET_KEY_BASE` và `VAULT_ENC_KEY` đã đổi.

### 0.2 Cấu hình đăng nhập và email trong `.env`

```ini
SITE_URL=https://covuaduongsinh.github.io/chessminigame/
API_EXTERNAL_URL=https://supabase.dsc.edu.vn
SUPABASE_PUBLIC_URL=https://supabase.dsc.edu.vn
ADDITIONAL_REDIRECT_URLS=duongsinh://**,http://localhost:8081/**,tauri://localhost/**

# Trẻ em vào app không cần email
ENABLE_ANONYMOUS_USERS=true
DISABLE_SIGNUP=false
ENABLE_EMAIL_SIGNUP=true
ENABLE_EMAIL_AUTOCONFIRM=false

# Gmail / Google Workspace: bật xác minh 2 bước, tạo App Password (16 ký tự)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=<hộp thư gửi, ví dụ noreply@dsc.edu.vn>
SMTP_PASS=<App Password>
SMTP_ADMIN_EMAIL=<hộp thư gửi>
SMTP_SENDER_NAME=Cờ vua Dương Sinh
```

Gmail gửi được khoảng 500 email/ngày, Google Workspace khoảng 2.000 email/ngày. Như vậy là đủ cho CLB và trường học.

### 0.3 Mẫu email tiếng Việt (làm sau giai đoạn 1)

Claude sẽ đưa 2 mẫu email lên GitHub Pages. Sau đó Thầy thêm vào phần `auth` → `environment` trong `docker-compose.yml`:

```yaml
GOTRUE_MAILER_TEMPLATES_MAGIC_LINK: https://covuaduongsinh.github.io/chessminigame/email/ma-dang-nhap.html
GOTRUE_MAILER_TEMPLATES_EMAIL_CHANGE: https://covuaduongsinh.github.io/chessminigame/email/xac-nhan-email.html
GOTRUE_MAILER_SUBJECTS_MAGIC_LINK: "Mã đăng nhập Cờ vua Dương Sinh"
GOTRUE_MAILER_SUBJECTS_EMAIL_CHANGE: "Xác nhận email cho tài khoản Cờ vua Dương Sinh"
```

Rồi chạy `docker compose up -d auth`.

### 0.4 Mở cổng Postgres cho GitHub Actions

Phương án đã chọn là kết nối thẳng, nên cổng database sẽ mở ra Internet. Để an toàn:

- **Bắt buộc bật TLS** trên cổng Postgres hoặc pooler (Supavisor), dùng chứng chỉ của `supabase.dsc.edu.vn`. Nếu không có TLS, mật khẩu database sẽ đi qua mạng dưới dạng chữ thường.
- Kiểm tra từ máy Thầy:
  `psql "postgresql://postgres.<POOLER_TENANT_ID>:<mật khẩu>@supabase.dsc.edu.vn:5432/postgres?sslmode=verify-full" -c "select 1"`
- GitHub → Settings → Secrets and variables → Actions → **New repository secret**:
  - `SUPABASE_DB_URL` = chuỗi kết nối ở trên.
- Sau này có thể chuyển sang SSH tunnel để đóng hẳn cổng database. Workflow chỉ cần đổi bước kết nối.

### 0.5 Realtime qua reverse proxy

Nếu đặt Nginx hoặc Caddy trước Kong, đường dẫn `/realtime/v1/` phải cho phép **WebSocket** (`Upgrade` và `Connection`). Thiếu bước này thì ván online và chấm xanh online sẽ không chạy.

### 0.6 Sao lưu

Đặt cron chạy `pg_dump` cả database (toàn bộ là dữ liệu app cờ) mỗi đêm và chép bản sao lưu ra ngoài VPS (Google Drive qua `rclone`). Mỗi quý nên thử khôi phục một lần.

### 0.7 Gửi cho Claude

Gửi **ANON_KEY** của VPS. Khóa này công khai, vốn nằm sẵn trong app, nên dán vào chat được.
**Tuyệt đối không gửi** `SERVICE_ROLE_KEY`, `JWT_SECRET` hay mật khẩu Postgres.

---

## Giai đoạn 1 — Claude làm trên repo ✅ (24/10/2026)

1. **Workflow `db-migrate.yml`:** chạy khi push lên `main` có thay đổi trong `supabase/migrations/**`, hoặc khi bấm tay.
   - Dùng `supabase/setup-cli`, rồi `supabase db push --db-url "$SUPABASE_DB_URL"`.
   - CLI tự ghi lại migration nào đã áp, nên chạy nhiều lần không bị áp trùng.
   - Lần chạy đầu sẽ áp 3 migration hiện có lên database mới.
2. **Migration mới `delete_my_account()`:** người dùng tự xóa tài khoản và toàn bộ dữ liệu của mình.
   - Thêm nút "Xóa tài khoản" trong Cài đặt. Cần cho quyền riêng tư của trẻ em (Nghị định 13/2023 về bảo vệ dữ liệu cá nhân).
   - Bài kiểm tra tự động dùng hàm này để tự dọn tài khoản test.
3. **Kiểm tra tự động trên VPS:**
   - Viết `packages/sync/test/live.test.ts`. Test này tự bỏ qua khi không có biến môi trường, nên không ảnh hưởng CI hằng ngày.
   - Workflow `supabase-smoke.yml` chạy tự động sau `db-migrate`, hoặc khi bấm tay.
   - Kịch bản gồm:
     - 3 tài khoản ẩn danh: chủ nhóm, thành viên, người ngoài.
     - Tạo nhóm, vào nhóm bằng mã.
     - Mời chơi, nhận lời, đi nước, kiểm tra **Realtime nhận được nước đi** và **Presence thấy bạn online**.
     - Đồng bộ tiến độ; trẻ bị chặn xem bảng sao của HLV; người ngoài không thấy dữ liệu nhóm.
     - Cuối cùng xóa cả 3 tài khoản.
4. **Chuyển app sang VPS:**
   - `DEFAULT_SYNC_CONFIG` trong `packages/sync`: URL mới và ANON_KEY của VPS.
   - CSP desktop trong `tauri.conf.json`: thay `*.supabase.co` bằng `https://supabase.dsc.edu.vn wss://supabase.dsc.edu.vn`.
   - Mẫu email tiếng Việt, đúng nhận diện Dương Sinh, có `{{ .Token }}`, đặt ở `apps/app/public/email/` để GitHub Pages phục vụ.
   - Cập nhật `CLAUDE.md`, `docs/ban-giao.md`, `docs/huong-dan-chay.md`.
5. **Phát hành:**
   - Web tự cập nhật khi push.
   - Desktop lên **v0.1.1**: tăng version, chạy workflow *Desktop (Tauri)* rồi *Phát hành bản desktop*.

## Giai đoạn 2 — Kiểm tra (Claude theo dõi qua GitHub Actions, Thầy thử tay)

- [ ] `db-migrate` xanh: 4 migration đã áp lên VPS.
- [ ] `supabase-smoke` xanh: đủ các bước ở mục 1.3.
- [ ] Thầy mở web bằng điện thoại, vào CLB, tạo nhóm, mời một máy khác chơi online được.
- [ ] Thầy gắn email trong Cài đặt và nhận được **mã 6 số** bằng tiếng Việt.
- [ ] Bộ cài desktop v0.1.1 kết nối được CLB.

## Giai đoạn 3 — Xóa Supabase Cloud (Thầy)

Chỉ làm khi giai đoạn 2 đã đạt hết:
- Supabase Dashboard → project `duongsinh-chess` → Settings → General → **Delete project**. Công cụ MCP của Claude không có quyền xóa project.
- Claude gỡ các chỗ còn nhắc tới Cloud trong tài liệu.

## Giai đoạn 4 — Sau đó

- **Kiểm luật cờ phía server:** Edge Function chạy trên VPS (thư mục `volumes/functions`), dùng `packages/chess-core`. Nên làm trước khi mở chơi công khai.
- Gắn tên miền riêng cho web, ví dụ `chess.dsc.edu.vn`: thêm bản ghi CNAME trỏ tới `covuaduongsinh.github.io`, rồi điền vào Settings → Pages → Custom domain. Khi đó bản web không cần `EXPO_BASE_URL` nữa.
- Theo dõi tài nguyên VPS: RAM, dung lượng đĩa, dung lượng database.

## Chi phí hạn mức Claude (ước tính)

Giai đoạn 1 là một phiên ngắn, chủ yếu viết file cấu hình và một file test, không cần chụp ảnh màn hình. Giai đoạn 2 chỉ đọc kết quả workflow. Việc trên VPS do Thầy làm hoặc chạy qua GitHub Actions, không tốn hạn mức Claude.
