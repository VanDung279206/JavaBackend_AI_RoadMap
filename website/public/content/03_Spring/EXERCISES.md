# Phase 3 — Spring Boot

Điều kiện: project Spring Boot có web, validation, Spring Data JPA và kết nối PostgreSQL; dữ liệu lấy từ phase 2. Các bài mở rộng dự án Knowledge Assistant. Xem [lời giải](SOLUTIONS.md). DSA đi kèm: D06 và D08.

## P3.1 — DTO và validation · Cơ bản

Tạo `CreateDocumentRequest(title, content)`. Title không trắng, tối đa 120 ký tự; content không null. `POST /documents` nhận DTO, lấy user từ danh tính đã xác thực và trả DTO kết quả với status 201. Viết hai ví dụ request sai và vị trí bắt lỗi.

## P3.2 — Repository có phạm vi người dùng · Trung bình

Viết truy vấn tìm tài liệu bằng cả ID và owner ID. Cùng ID=101, người 1 tìm thấy, người 2 không tìm thấy. Giải thích vì sao không nhận owner ID từ query parameter làm căn cứ quyền truy cập.

## P3.3 — Phân trang và lỗi rõ ràng · Trung bình

Cho phép `page >= 0`, `1 <= size <= 100`; sắp `createdAt DESC, id DESC`. Input page=-1 hoặc size=0 phải là lỗi 400. ID không tìm thấy trong phạm vi người dùng trả 404. Với danh sách `[10,20,30]`, page=1,size=2 → `[30]`; page rất lớn → `[]` ở bài Java thuần.

## P3.4 — Giao dịch nghiệp vụ · Trung bình

Một thao tác phải lưu cả tài liệu và audit. Thiết kế service transaction; nếu lưu audit ném unchecked exception, kỳ vọng tài liệu mới cũng không được lưu. Nêu cách kiểm chứng bằng integration test với database thật và các điều kiện khiến transaction không được áp dụng.

## Đạt phase khi

- [ ] Phân biệt DTO, entity và repository.
- [ ] Có kiểm tra input lẫn kiểm tra quyền sở hữu.
- [ ] Có tình huống lỗi của từng endpoint.
- [ ] Giải thích được điều kiện rollback và boundary của transaction.