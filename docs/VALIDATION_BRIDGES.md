# Kiểm chứng bài SQL/Spring có hướng dẫn

Phạm vi: SQLB01–SQLB03 và SPRB01–SPRB03 trên `feature/next-upgrade`, ngày 13/10/2026. Đây là kiểm chứng bản tham chiếu, không phải bài hoàn thành của người học. Chưa đánh giá độ khó với người mới.

## Lượt kiểm cục bộ

| Phạm vi | Kết quả |
| --- | --- |
| `scripts/check_spring_bridges.py` | PASS: cả ba starter FAIL đúng chỗ; mỗi bản chỉ được sửa file chứa phần khuyết rồi bốn contract Bridge PASS, không skip |
| DTO | Các biên 120/20.000, null/trắng, vượt giới hạn và content rỗng; gọi Validator thật |
| Repository | JPA/H2: đọc đúng ID/owner, đọc chéo và ID thiếu/âm trả Missing |
| Transaction | H2: success commit document/audit; lỗi sau audit INSERT rollback cả hai; test không có transaction bao ngoài |
| Python regression | 34/34 PASS, gồm tạo ba bản chỉ thay đổi một file và từ chối ghi đè/step sai phase |
| Website regression | 90/90 PASS |
| Lint, TypeScript/build/export | PASS: 37 route, 110 bài/14 track/6 course; catalogue --check PASS |
| Playwright trên bản export | 28/28 luồng PASS, gồm bộ lọc ba bài, liên kết bài học, sáu đề/gợi ý/lời giải ở 1440px và 390px, đổi hash/Back/hash sai |
| Markdown nội bộ | 475 link PASS |

Log cục bộ: `checks/spring-bridges.log`, `checks/upgrade-python.log`, `checks/upgrade-node.log` (file log bị ignore).

Hai lỗi UI tìm thấy trong kiểm browser đã sửa: đổi hash phải chọn đúng bài và đóng lời giải cũ; khối lệnh dài trong hướng dẫn chung phải cuộn trong khung để không kéo trang rộng ra trên mobile. Link nguồn trong catalogue và nút mở file dùng nhánh mặc định `main`, thay cho nhánh cũ không có bài mới.

Docker daemon cục bộ chưa chạy; không coi cú pháp/đọc code là PostgreSQL PASS. CI integration chạy solution và starter từng SQLB trong phiên PostgreSQL 17 mới. Solution phải exit 0 và có marker PASS; starter phải exit 3 và chứa assertion của đúng ID. Các assertion đổi owner/ngày/cursor/page size, thêm user/tài liệu và xóa mọi tài liệu để kiểm biên và tránh ghi cứng.

## Triển khai và giới hạn

Catalogue tăng từ 104 lên 110 bài. Sau merge, website deploy và database phải dùng cùng seed mới (`database/catalogue_seed.sql`); seed chỉ upsert catalogue, không thay schema. Bài mới chưa đăng ký trên database sẽ chưa đồng bộ tiến độ tài khoản; bằng chứng tự đối chiếu không cấp verified.

H2 kiểm service/transaction, không chứng nhận các hành vi riêng của PostgreSQL; workflow vẫn giữ suite PostgreSQL/Testcontainers đầy đủ. SQLB03 chỉ xử lý trang sau cursor không null, không hứa snapshot xuyên nhiều request. Không đổi nội dung bài cũ hoặc xóa tiến độ cũ.

## Review bổ sung ngày 16/10/2026

Review lại commit `3852c73`, PR #11 chưa có review thread mới. Đã tái hiện và sửa ba lỗi:

- Bộ tách đề chỉ nhận ID dạng P3.1 nên 986 ký tự của đề SPRB01 bị đặt vào phần hướng dẫn chung. Nhận cả SQLB/SPRB và các ID không có dấu chấm; browser kiểm không có đề khác lặp trong hướng dẫn chung ở 1440px/390px.
- Hash lỗi như `#%E0%A4` trên trang bài học ném `URI malformed` và thay nội dung bằng “This page couldn’t load”. Bỏ qua hash không giải mã được, giữ bài hiện tại; reload an toàn về bài đầu, chờ hydration trước khi xác nhận.
- Contract SPRB02 chỉ có một tài liệu mỗi owner nên code kiểm ID hợp lệ nhưng trả tài liệu đầu tiên của cùng owner vẫn PASS. Thêm tài liệu thứ hai cùng owner và đối chiếu ID/title/content. Gate tích hợp cố ý tạo biến thể sai này trong bản tạm và yêu cầu test phải từ chối nó.

Trước sửa: browser regression FAIL ở phần hướng dẫn bị lặp; probe URL lỗi ghi nhận `URI malformed`, không thấy bài học; biến thể repository sai vẫn PASS contract cũ. Sau sửa: ba starter Spring bị từ chối đúng lý do, ba bản sửa đạt bốn contract; biến thể repository sai bị từ chối. 90/90 test website, 34/34 Python, lint, TypeScript/build 37 route/110 bài và 29 luồng browser PASS. Log cục bộ `checks/review11-*.log` bị ignore. CI mới được liên kết trong mô tả PR; các kết quả CI của commit cũ không thay cho lượt chạy mới.

## Review tìm kiếm và cursor ngày 16/10/2026

- Tìm kiếm một bài khác trong cùng chặng dùng router push nên URL đổi sang SQLB03 nhưng nội dung vẫn ở SQLB01. Chuyển tìm kiếm có hash trong cùng trang sang điều hướng hash gốc của trình duyệt; chọn lại cùng hash phát sự kiện để mở lại bài học nếu đang ở tab luyện tập. Regression kiểm SQL/Spring, Back và chọn lại cùng bài; các luồng tiếng Anh cũ vẫn được giữ.
- Các ID của fixture cursor ban đầu tăng cùng chiều ngày tạo nên chưa phân biệt truy vấn chỉ so/sort ID với cursor hai khóa. Thêm ID 10 có ngày mới hơn và ID 999 có ngày cũ hơn, kiểm cả trang kết quả và timestamp gốc. CI yêu cầu ba query cố ý sai (lọc chỉ ID, sort chỉ ID, thay timestamp) phải exit 3 với đúng assertion; bản tham chiếu vẫn phải PASS.

Kiểm cục bộ: browser trước sửa FAIL vì URL SQLB03 vẫn hiển thị SQLB01; sau sửa 30/30 luồng browser PASS ở bản export. 90/90 test website, 34/34 Python, lint, TypeScript/export 37 route/110 bài, catalogue và 475 link Markdown nội bộ PASS. Docker cục bộ chưa hoạt động nên các ca PostgreSQL mới được kiểm trên CI; liên kết và kết quả cuối trong mô tả PR. Log `checks/review11-round3-*.log` bị ignore.
