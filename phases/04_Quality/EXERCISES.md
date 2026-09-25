# Phase 4 — Kiểm thử, quyền truy cập và triển khai

Xem [lời giải](SOLUTIONS.md). DSA đi kèm: D09 và D12.

## P4.1 — Hai người dùng · Trung bình

Viết `requireOwned(docs, id, principalUserId)` cho kho tài liệu trong bộ nhớ. User 1 có doc 101. User 1 đọc 101 được; user 2 đọc 101 và user 1 đọc ID=999 đều ném `NotFound`. Thiết kế này chỉ kiểm tra quyền sở hữu; đầu vào `principalUserId` phải đến từ lớp xác thực tin cậy.

## P4.2 — Kiểm thử bắt được lỗi · Trung bình

Viết kiểm tra cho ba trường hợp P4.1, ID trùng ở P1.2 và page quá lớn ở P3.3. Sau đó cố ý bỏ điều kiện owner: kiểm tra nào phải thất bại? Đầu ra: kết quả kiểm tra và giải thích lỗi được phát hiện.

## P4.3 — Đóng gói và cấu hình · Trung bình

Với JAR đã build của ứng dụng Spring, viết Dockerfile chạy bằng JRE 21. Database URL/username/password và API key đi qua cấu hình môi trường khi chạy. Đầu ra: Dockerfile, lệnh build/run và cách kiểm tra ứng dụng. Giải thích vì sao `localhost` của container ứng dụng không mặc nhiên là database ở container khác.

## P4.4 — Quy trình CI có tiêu chí · Trung bình

Thiết kế các bước: checkout → chuẩn bị JDK → kiểm tra Java thuần → chạy kiểm thử ứng dụng → đóng gói. Một kiểm tra lỗi phải làm pipeline dừng. Xác định thông tin cần ghi khi API lỗi và những dữ liệu không nên đưa vào log.

## Đạt phase khi

- [ ] Kiểm tra quyền thất bại khi cố ý xóa điều kiện owner.
- [ ] Biết phần nào được unit test, phần nào cần HTTP/database integration test.
- [ ] Mô tả được cấu hình khi chạy container và tiêu chí CI thành công.