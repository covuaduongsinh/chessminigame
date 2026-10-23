# CLAUDE.md — Dương Sinh Chess

Ứng dụng học cờ vua cho trẻ em của Công ty CP Cờ vua Dương Sinh (slogan "Vui trí tuệ"), lấy cảm hứng từ Acorn Chess. Một mã nguồn cho Web, Desktop (Tauri 2) và Mobile (Expo), đồng bộ qua Supabase.

Người dùng là **Thầy Tường** (nhà sáng lập, HLV cờ vua). Trả lời bằng **tiếng Việt**, gọi là "Thầy". Đi thẳng vào việc và ưu tiên đưa kết quả dùng được ngay.

## Lệnh hay dùng

```bash
pnpm install
pnpm web                       # Expo web tại http://localhost:8081
pnpm dev                       # Expo Go (quét QR)
pnpm check                     # biome + typecheck + vitest (chạy trước mỗi commit)
pnpm build:web                 # xuất web tĩnh ra apps/app/dist
pnpm --filter @duongsinh/app e2e          # Playwright 8 kịch bản (cần build:web trước)
pnpm desktop:dev | desktop:build          # Tauri 2 (cần Rust + VS C++ Build Tools trên Windows)
node scripts/gen-icons.mjs     # vẽ lại icon từ SVG (Playwright Chromium)
node scripts/gen-sounds.mjs    # tổng hợp lại file âm thanh WAV
```

Chạy test của một package: `pnpm --filter @duongsinh/minigames test`.

## Cấu trúc

- `packages/chess-core`: luật cờ 0x88, FEN/SAN/PGN, perft, thế không có Vua, `explainIllegalMove`. Không phụ thuộc React.
- `packages/engine`: máy 6 cấp (`LEVELS`, `chooseMove`, `hint`, `thinkAsync`). Mini-game truyền luật thắng thua riêng qua `Objective`.
- `packages/minigames`: nội dung dạng dữ liệu trong `src/content/*.ts` (tot, ma, tuong, xe, hau, vua, endgames, classics), `MiniGameSession` (máy trạng thái), `solveCollect` (BFS), `buildCustomGame`.
- `packages/ui`: `Board.tsx` (react-native-svg + PanResponder), bộ quân SVG tự vẽ, `theme.ts` (màu thương hiệu).
- `packages/sync`: Supabase client và các RPC (`ensureSession`, `pushProgress`, nhóm, ván online, `custom_games`, Presence).
- `apps/app`: Expo Router, route tiếng Việt không dấu: `(tabs)/index|choi|tan-cuoc|phan-tich|clb`, `minigame/[id]`, `hlv/`, `lop-hoc/`, `tu-tao/[id]`, `game/[id]`, `cai-dat`. Store Zustand ở `src/lib/store.ts`, chuỗi giao diện ở `src/locales/vi.json` và `en.json`.
- `apps/desktop`: Tauri 2, nạp `../app/dist`. Có cấu hình riêng `tauri.linux.conf.json` và `tauri.windows.conf.json`.
- `supabase/migrations`: schema, RLS, RPC. Đã áp lên project `duongsinh-chess`.
- `docs/`: `kien-truc.md`, `huong-dan-chay.md`, `ban-giao.md` (trạng thái và việc tiếp theo), `research/acorn-feature-map.md`.

## Quy ước bắt buộc

- **Pháp lý:** chỉ tham khảo tính năng của Acorn Chess. Không chép code, hình, âm thanh, câu chữ hay tên mini-game của họ. Nội dung mới phải do Dương Sinh tự viết.
- **Thương hiệu:** navy `#2B3990`, gold `#FBB040`, font Roboto, họa tiết ô cờ. Lộ trình 6 cấp Tốt → Mã → Tượng → Xe → Hậu → Vua. Dùng token trong `packages/ui/src/theme.ts`, không viết mã màu cứng.
- **Mini-game mới:** thêm object vào `packages/minigames/src/content/<cấp>.ts`, `order` tăng dần, chuỗi song ngữ `{ vi, en }`. Bắt buộc chạy `pnpm --filter @duongsinh/minigames test`: test tự giải mọi bài, bài không giải được là test đỏ. Không bao giờ tắt hay bỏ qua test.
- Viết câu chuyện cho bài học theo lối kể chuyện, có nhân vật nhỏ tên gần gũi (Bin, Bông, …).
- Biome định dạng code (dấu nháy đơn, dòng tối đa 100 ký tự). Markdown không bị format. Code theo TypeScript strict.
- Commit message bằng tiếng Việt, mô tả "vì sao".

## Những điểm dễ vấp

- `.npmrc` đặt `node-linker=hoisted`: bắt buộc để Metro chạy được trong monorepo. Đừng xóa.
- Trên web, `_layout.tsx` **không chờ** font Roboto, vì WebKit (Safari, app desktop) có lúc treo việc tải font và làm trắng màn hình. Giữ nguyên cách này.
- Tauri: `dangerousDisableAssetCspModification: ["style-src"]` là bắt buộc. Nếu bỏ, Tauri chèn nonce làm `'unsafe-inline'` mất tác dụng và react-native-web mất toàn bộ style.
- Gói `.deb` phải có tên không dấu (đã đặt trong `tauri.linux.conf.json`). Windows chỉ build NSIS vì MSI/WiX không nhận tên có dấu.
- Ván online: server (`play_move`) chỉ kiểm tra lượt, ply và tư cách người chơi. Luật cờ do client kiểm tra.
- Supabase project `duongsinh-chess` (id `agsydzfefbawezpunxwd`, ap-southeast-1). URL và khóa publishable (công khai) nằm trong `DEFAULT_SYNC_CONFIG` của `packages/sync`. Có thể ghi đè bằng `EXPO_PUBLIC_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_KEY`, hoặc tắt đồng bộ bằng `EXPO_PUBLIC_SYNC=off`. Không bao giờ đưa khóa `service_role` vào app.
- E2E chọn bàn cờ đang hiển thị bằng `getByTestId('board').filter({ visible: true }).first()`, vì stack màn hình web giữ cả bàn cờ của màn trước.

## Kiểm tra trước khi push

`pnpm check` → `pnpm build:web` → `pnpm --filter @duongsinh/app e2e`. GitHub Actions `ci.yml` chạy đúng chuỗi này trên mọi push và PR.
