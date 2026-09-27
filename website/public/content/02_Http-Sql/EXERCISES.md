# Phase 2 — HTTP và SQL

Dữ liệu giả lập: người dùng An=1, Bình=2, Chi=3; tài liệu 101 và 102 thuộc An, 201 thuộc Bình. Chi chưa có tài liệu. Đối chiếu [lời giải](SOLUTIONS.md) sau khi tự làm. DSA đi kèm: D05 và D07.

## P2.1 — Hợp đồng API · Cơ bản

Thiết kế method, path, status thành công và lỗi cho: tạo tài liệu; đọc theo ID; xóa theo ID. Title không được trắng. API chọn không tiết lộ sự tồn tại của tài liệu ngoài quyền: người đã đăng nhập đọc tài liệu người khác nhận 404. Phân biệt trường hợp chưa đăng nhập.

Đầu ra: bảng endpoint và một request/response tạo tài liệu. Không nhận `ownerId` từ request body làm căn cứ cấp quyền.

## P2.2 — Schema và đếm tài liệu · Cơ bản

Tạo bảng người dùng và tài liệu có khóa ngoại. Viết truy vấn trả cả người dùng có 0 tài liệu. Kết quả kỳ vọng: An=2, Bình=1, Chi=0. Thử giải thích khác nhau giữa `COUNT(*)` và `COUNT(d.id)` trong `LEFT JOIN`.

## P2.3 — Phân trang và index · Trung bình

Liệt kê tài liệu của An theo `created_at DESC, id DESC`, page size=1. Lần đầu nhận 102; lần sau, dùng cursor của 102 để nhận 101. Thiết kế index phù hợp và giải thích vai trò ID khi hai tài liệu cùng thời điểm. Chưa kết luận index tăng tốc từ bộ dữ liệu chỉ có ba dòng.

## P2.4 — Transaction · Trung bình

Trong một transaction, thêm tài liệu 103 và bản ghi audit tương ứng, rồi rollback. Kỳ vọng: 103 không tồn tại, bản ghi audit của lần thêm đó không tồn tại. Sau đó nêu cách kiểm tra trường hợp commit.

## Đạt phase khi

- [ ] Viết được schema và truy vấn đếm mà không bỏ người dùng có 0 tài liệu.
- [ ] Phân biệt được 400, 401, 404 và 409 trong hợp đồng đã chọn.
- [ ] Giải thích được thứ tự ổn định, cursor và rollback.