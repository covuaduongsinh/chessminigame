# Bản đồ tính năng Acorn Chess (phân tích bằng REA)

> Mục đích: hiểu Acorn Chess **có những tính năng gì và vận hành ra sao** để thiết kế sản phẩm riêng của Dương Sinh.
> Tài liệu chỉ tóm tắt bằng lời của mình. Không sao chép mã nguồn, hình ảnh, âm thanh hay câu chữ của Acorn Chess
> (đúng theo phạm vi sử dụng hợp pháp trong `DISCLAIMER.md` của REA).

## Cách phân tích

| Mục          | Nội dung                                                                                                                        |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| Công cụ      | REA `rea-agents@6.7.0` (repo `covuaduongsinh/rea`)                                                                              |
| Cách làm     | Gắn REA vào Chromium headless qua Chrome DevTools Protocol (cổng 9222, chỉ loopback)                                            |
| Lệnh dùng    | `list-browser-targets`, `inspect-web-page --include-accessibility-text`, `analyze-web-bundle`                                   |
| Trang đã xem | `/`, `/demo`, `/multiplayer`, `/minigames`, `/tutors`, `/classroom`, `/download`                                                |
| Ngày         | 22/10/2026                                                                                                                      |
| Evidence ID  | trang chủ `ev_70f302e4…`, multiplayer `ev_866f48b5…`, minigames `ev_e19b4bf9…`, tutors `ev_4561ac45…`, classroom `ev_a48d103f…` |

Kết quả kỹ thuật:
- **Site marketing** là trang tĩnh, mỗi trang có khoảng 10 đoạn script nhỏ nhúng thẳng trong HTML, dùng để đo lượt xem (gửi về `/api/event`, `/api/view`). `analyze-web-bundle` không thấy route ứng dụng hay framework SPA nào.
- **Ứng dụng chính** phát hành dưới dạng file cài đặt cho Windows (`.msi`), macOS (`.pkg`) và Linux/Raspberry Pi, tải qua Dropbox. Bản chơi online chạy trên trình duyệt. Chúng ta **không** tải về hay phân tích ngược ứng dụng của họ vì không cần cho mục tiêu thiết kế.

## Tính năng quan sát được → cách Dương Sinh làm

| Nhóm                        | Acorn Chess (tóm tắt)                                                 | Dương Sinh Chess                                                                                                        | Trạng thái                  |
| --------------------------- | --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | --------------------------- |
| Mini-game                   | Hơn 150 mini-game: cách đi quân, nhìn bàn cờ, chiến lược              | 36 mini-game theo lộ trình 6 cấp Tốt → Vua, có câu chuyện, sao thưởng, mở khóa dần                                      | ✅ (mở rộng dần)            |
| Thế cờ không có Vua         | Cho xếp và chơi "mảnh thế cờ" không cần 2 Vua                         | `chess-core` hỗ trợ thế không Vua (nước giả hợp lệ, không xét chiếu)                                                    | ✅                          |
| Luật mini-game              | Mỗi bài có điều kiện thắng riêng (đưa Tốt sang bên kia, ăn hết quân…) | Các chế độ: ăn sao, mê cung, né bẫy, đua Tốt, chặn Tốt, sống sót, chiếu hết, bài tập, câu hỏi, ván đầy đủ, ăn liên hoàn | ✅                          |
| Hướng dẫn khi đi sai        | Giải thích vì sao nước đi không được phép                             | `explainIllegalMove()`: nói rõ lý do (quân không đi như vậy, bị chặn, đang bị chiếu, Vua vào ô bị khống chế…)           | ✅ (thêm sau khi phân tích) |
| Máy cho trẻ                 | 6 cấp; cấp thấp mắc lỗi điển hình của trẻ mới học                     | 6 cấp Máy Tốt → Máy Vua; tỉ lệ đi hớ, chọn nước softmax                                                                 | ✅                          |
| Bàn xếp thế                 | Trình xếp thế trực quan                                               | Bàn phân tích → "Xếp thế" (bảng quân, tẩy, đổi lượt)                                                                    | ✅                          |
| HLV tự tạo mini-game        | Tự chỉnh/tạo mini-game với điều kiện thắng riêng                      | "Tạo bài": xếp thế, đặt sao, chọn chế độ, lưu, chia sẻ cho nhóm                                                         | ✅ (thêm sau khi phân tích) |
| Vẽ chú thích                | Mũi tên, khoanh ô                                                     | Chế độ ✏️: kéo để vẽ mũi tên, chạm để tô ô                                                                              | ✅                          |
| Bài giảng / nội dung có sẵn | Bài học dựng sẵn, hơn 300 ván kinh điển có chú giải                   | 10 ván kinh điển chú giải tiếng Việt, 12 tàn cuộc, giao bài theo nhóm                                                   | 🟡 (cần bổ sung ván)        |
| Nhập PGN/FEN                | Từ Lichess, Chess.com, ChessBase…                                     | Dán PGN, chọn file .pgn, lấy ván Lichess theo mã, sao chép FEN/PGN                                                      | ✅                          |
| Chơi online                 | Chỉ trong nhóm riêng; trình duyệt trên máy tính, tablet, điện thoại   | Nhóm riêng (CLB/Lớp/Gia đình), mã 6 ký tự + QR, mời chơi, Realtime                                                      | ✅                          |
| An toàn cho trẻ             | Không cần tài khoản/email, tên tự sinh, không chat                    | Đăng nhập ẩn danh, tên tự sinh ("Mã Xanh 27"), không chat, không người lạ                                               | ✅                          |
| Ai đang online              | Thấy thành viên nào trong nhóm đang online                            | Supabase Realtime Presence: chấm xanh cạnh tên                                                                          | ✅ (thêm sau khi phân tích) |
| Lớp học / bảng tương tác    | Bàn lớn cho IWB, tối ưu cảm ứng, bấm-để-đi                            | Chế độ lớp học: bàn tới 900px, phím ← → F D R, trình diễn lời giải                                                      | ✅                          |
| Offline                     | Chạy không cần mạng (trừ online)                                      | Mọi phần học/chơi máy chạy offline, tiến độ lưu trên máy rồi đồng bộ sau                                                | ✅                          |
| Đa nền tảng                 | Windows, Mac, Linux, Raspberry Pi + trình duyệt                       | Web (PWA), Windows/Mac/Linux (Tauri 2), iOS/Android (Expo)                                                              | ✅                          |
| Tự cập nhật                 | Tự kiểm tra bản mới khi khởi động                                     | Web tự cập nhật; mobile qua EAS Update; desktop qua plugin updater của Tauri (cấu hình sau)                             | 🟡                          |
| Miễn phí                    | Không phí ẩn                                                          | Tùy chiến lược kinh doanh của Dương Sinh (xem gợi ý bên dưới)                                                           | —                           |

## Các cơ chế mini-game Acorn có mà Dương Sinh nên có phiên bản riêng

| Cơ chế (mô tả chung)                                | Phiên bản Dương Sinh                       | Trạng thái |
| --------------------------------------------------- | ------------------------------------------ | ---------- |
| Đua Tốt                                             | "Trận chiến Tốt" (cấp Tốt)                 | ✅         |
| Tốt chống một quân                                  | "Mã/Tượng/Xe/Hậu đấu Tốt"                  | ✅         |
| Mã ăn hết Tốt đứng yên                              | "Mã bắt hết quân"                          | ✅         |
| Mê cung, đi qua ô an toàn                           | "Mã né bẫy", "Xe dọn đường"                | ✅         |
| Ăn quân ở mọi nước (thứ tự quan trọng)              | "Ăn liên hoàn" (`mustCapture`)             | ✅ (thêm)  |
| Đặt Vua đen vào thế chiếu hết / hết nước / bị chiếu | "Đặt Vua" (câu hỏi chọn ô, đáp án tự tính) | ✅ (thêm)  |
| Xếp quân về vị trí ban đầu                          | Có thể thêm vào cấp Tốt                    | ⬜         |
| Thả quân lên bàn                                    | Cần giao diện thả quân                     | ⬜         |

## Gợi ý cho Dương Sinh

1. **Khác biệt bằng nội dung tiếng Việt và lộ trình 6 cấp.** Acorn mạnh ở số lượng mini-game. Dương Sinh mạnh ở câu chuyện, nhân vật và giáo trình gắn với lớp học thật.
2. **Nhóm CLB là kênh tăng trưởng.** Mỗi HLV tạo nhóm, gửi QR cho phụ huynh, nên mỗi lớp đều thành người dùng. Có thể dùng bảng sao theo cấp làm báo cáo gửi phụ huynh hằng tuần.
3. **Mở rộng thư viện ván kinh điển** (Acorn có hơn 300). Đây là nội dung dễ sản xuất từ PGN công khai cộng lời bình tiếng Việt của thầy.
