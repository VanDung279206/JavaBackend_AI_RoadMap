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
