# Kiểm chứng khu học tiếng Anh

Ngày kiểm bản khởi tạo: 2026-10-09 UTC; nâng cấp và kiểm lại: 2026-10-10, Linux. Lần đầu dùng Node 24.19.0; kiểm lại bản cuối với Node 20.20.2, cùng phiên bản chính của CI. Nhánh `feature/english-learning` bắt đầu từ main `3413b866443c30c18fc30177ae3f9ca5beb61968`; main remote vẫn ở commit này khi kiểm lại trước review. Đọc `website/AGENTS.md` và hướng dẫn static export/client component kèm Next 16.3.6 trước khi sửa.

## Phạm vi đã triển khai

`/english` có tổng quan, từ vựng, đọc hiểu, đọc lỗi, viết và ôn tập. Giữ 72 thuật ngữ, 6 đoạn đọc, 8 log fixture và nội dung viết/nhầm từ/mẫu câu cũ; bổ sung 219 bài có đáp án và 16 nhiệm vụ viết. Mỗi chặng chính có ít nhất ba bài luyện câu với mục tiêu khác nhau, một bài đọc và nhiệm vụ dùng code thật. Setup và DSA vẫn truy cập riêng.

Menu desktop/mobile, tìm kiếm, 14 trang bài tập, sáu trang học chặng và Hôm nay đều nối khu tiếng Anh. Từ glossary có ID đăng ký ổn định, không theo vị trí trong bảng. Build từ chối câu hỏi có loại lỗi/trích log mâu thuẫn với fixture.

Tiến độ localStorage tách khách/tài khoản. Chấm đáp án, tự đối chiếu câu/bài viết và mức nhớ tự chọn được ghi riêng. Không gọi dịch vụ AI hoặc cấp verified PASS lập trình. JSON có xem trước, thay thế toàn bộ phạm vi tiếng Anh và kiểm baseline trong khóa trước khi nhập.

## Các lệnh đã chạy

| Kiểm tra | Kết quả |
| --- | --- |
| `npm ci`, sau đó thêm Playwright 1.62.1 và cập nhật lockfile | PASS |
| `npm test` | 81/81 PASS với Node 20.20.2; gồm 48 test hồi quy cũ và 33 test tiếng Anh/nội dung mới. Bản khởi tạo trước nâng cấp: 75/75; lần đầu Node 24.19.0: 74/74 |
| `npm run lint` | PASS |
| `npx tsc --noEmit` và TypeScript trong build | PASS |
| `npm run build`, postbuild kiểm export | PASS, 37 trang; 14 track/104 bài lập trình, sáu khóa học, `/english`, `/projects/mine`, `/today`, auth/reset và các công cụ cũ |
| `node scripts/build_catalogue.mjs --check` | PASS, catalogue lập trình và tiếng Anh khớp nguồn |
| `python3 scripts/error_examples.py --verify` | PASS E01–E08: diagnostic fixture cố ý lỗi; không kiểm bài sửa của người học |
| `python3 scripts/check_links.py` | PASS; chỉ liên kết Markdown nội bộ, không xác minh URL ngoài |
| `git diff --check` | PASS |
| `npm run test:browser` | PASS, 15 luồng trên Chromium 151.0.7922.34 với static export thực, Node 20.20.2 |

Build dùng URL/key Supabase **placeholder** cho kiểm static, không dùng tài khoản production. Lần build không có env bị dừng bởi cấu hình Supabase hiện có; sau khi đặt env, build/export hoàn tất. Browser test chặn request ngoài localhost. Không có thao tác triển khai website, migration database hay ghi tiến độ người dùng thật.

## Trình duyệt thực và harness

Chromium headless, desktop 1440×1000 và viewport mobile 390×844:

1. Tổng quan, menu desktop, khởi tạo khách và liên kết bài ngay trong cùng trang.
2. Tìm kiếm toàn website → thuật ngữ cụ thể; chọn nghĩa, điền từ, tự dùng trong câu và reload giữ nội dung.
3. Đọc đoạn tiếng Anh, tra nghĩa bằng popover, mở bản dịch, đánh dấu đọc và sắp câu.
4. Viết commit/giải thích; chỉnh nội dung làm mất trạng thái tự đối chiếu cũ.
5. Flashcard khóa mở đáp án trước khi nhập; chọn mức nhớ và kiểm ngày ôn/lịch sử trong localStorage thật.
6. Tải file JSON thật; nhập xem trước; hai tab sửa/nhập cùng phạm vi: từ chối baseline cũ, chọn lại và nhập hợp lệ thành công.
7. Đủ tám log và 32 câu hỏi diagnostic; mô tả rõ nguồn fixture và phạm vi chấm.
8. Hôm nay → tiếng Anh, học Spring → bài đọc, DSA → từ vựng; đường dẫn giữ basePath GitHub Pages.
9. Phân trang flashcard truy cập đủ 72 từ.
10. Menu mobile và năm khu học không gây tràn ngang toàn trang; làm bài điền từ và viết/tự đối chiếu, reload giữ bài viết. Bảng dùng cuộn ngang cục bộ.
11. Khi không có speechSynthesis, hiện thông báo và khóa nút phát âm.
12. Tìm từ theo nghĩa tiếng Việt: chữ Đ/đ, hoa/thường và truy vấn bỏ dấu đều khớp; truy vấn không tồn tại hiện trạng thái trống, xóa truy vấn khôi phục danh sách.

13. Hết từ đến hạn không tự chuyển sang toàn bộ danh sách; chọn luyện thêm rõ ràng, khóa input/nút mức nhớ sau khi lưu một lượt.
14. Sáu bài SQL/Spring hiển thị trace và gợi ý theo thao tác; chấm các đáp án `zero` và `rolls back` trên static export thực.
15. Bản lưu đã hoàn thành từ vựng mở đọc; sau đọc/luyện mở viết từ tổng quan và Hôm nay. Hoàn thành toàn bộ mở lịch ôn.

Kiểm lại trước review phát hiện bộ lọc từ vựng chưa chuẩn hóa chữ **Đ** viết hoa trước khi chuyển chữ thường. Đã dùng chung hàm chuẩn hóa Đ/đ và dấu tiếng Việt, thêm test domain và browser cho các truy vấn `đối tượng cụ thể`, `ĐỐI TƯỢNG CỤ THỂ`, `doi tuong cu the`. Bản cuối chạy lại test, lint, build/export và browser với Node 20.20.2 đều đạt.

Ảnh desktop/mobile đã được chụp và kiểm trực quan. Đây là viewport mô phỏng, chưa phải điện thoại vật lý. Speech không hỗ trợ được kiểm thực trong trình duyệt bằng cách loại API; chọn giọng English/no-voice và lịch ôn được kiểm bằng test domain. Chưa nghe/xác minh âm thanh trên thiết bị có giọng English.

Harness chạy **logic thật** trong các ngữ cảnh độc lập với storage/hàng đợi Web Locks mô phỏng: tách khách/tài khoản, reload, hai tab ghép các trường riêng, nhiều lần nhập đang chờ, xuất bằng handler cũ khi còn ghi chờ, quota/JSON hỏng, nhập khi baseline vừa đổi, thiếu Web Locks; bản lưu đạt mọi giới hạn text vẫn nằm trong giới hạn nhập 32 MiB, kể cả ký tự cần escape. Test component kiểm handler cũ không chấm/xác nhận câu trả lời hoặc bài viết đã bị tab khác sửa. Không gọi các ca harness này là kiểm Supabase hoặc trình duyệt native.

## Giới hạn

- Chưa kiểm đăng nhập/chuyển tài khoản với Supabase thật; cách chia namespace đã kiểm bằng harness. Tiến độ tiếng Anh chưa đồng bộ server, chuyển thiết bị bằng JSON.
- Bài tự viết chỉ có mẫu và tiêu chí tự đối chiếu; các câu hợp lệ ngoài danh sách đáp án cố định có thể cần đối chiếu thủ công. Chưa tích hợp AI.
- Không có IPA chưa kiểm chứng; chất lượng/giọng phát âm phụ thuộc thiết bị. Lưu cần Web Locks trên HTTPS/localhost; thiếu API thì báo chưa lưu.
- Chưa kiểm Safari/Firefox, điện thoại thật, mất điện giữa ghi localStorage hoặc audio thật. Đã chạy tại workspace với Node 20 cùng phiên bản chính của CI; Đã xác nhận hai workflow Website CI và Verify reference implementations của commit `7e538aa` đạt trên GitHub Actions trước nâng cấp; xem PR cho CI bản tiếp theo. Supabase hiện cảnh báo Node 20 sắp hết hỗ trợ; nâng runtime CI là việc riêng.
- Cùng một trường bị hai tab sửa: lần ghi sau trong khóa có hiệu lực. Nhập JSON thay toàn bộ tiến độ tiếng Anh, có cảnh báo và baseline; không tự hòa trộn nội dung viết xung đột.
- Nhánh đã đăng và có [PR #10](https://github.com/VanDung279206/JavaBackend_AI_RoadMap/pull/10). Git CLI chưa có credential ghi; cập nhật qua GitHub API, kiểm tree trùng bản local. Chưa merge hoặc triển khai website.

Các việc tiếp theo theo thứ tự nằm ở [BACKLOG](BACKLOG.md): bài trung gian SQL/Spring, đồng bộ bài học/dự án, nhận xét từng mốc dự án riêng.

Xem [hướng dẫn review và áp dụng diff](REVIEW_ENGLISH.md) để kiểm bản thay đổi đầy đủ trước PR.

## Nâng cấp sau PR #10

Đã sửa gợi ý luôn mở từ vựng, tránh bỏ qua bài sửa câu/từ vựng khi chọn chặng tiếp theo, tách ôn đến hạn với luyện thêm và khóa lượt đã đánh giá. Không suy ra mọi bài viết bắt đầu WRITE-E là bài viết lỗi; dùng đúng ID liên kết tới error. Nút tiếp tục chờ tải tiến độ. Các ID, đáp án và schema tiến độ cũ được giữ; sáu ID mới bắt đầu chưa làm.

Ba query SQL trong context được thực chạy bằng sqlite3 trên chính fixture input ghi trong bài, đối chiếu output. Đây không phải kiểm PostgreSQL. Ba trace Spring là hợp đồng minh họa có giả định validation/transaction rõ ràng; chưa chạy ứng dụng Spring cho các ví dụ mới. Test component kiểm chống click đúp/lượt đã chấm; browser kiểm chế độ ôn và bài mới.
