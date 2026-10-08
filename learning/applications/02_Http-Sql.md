# Mốc dữ liệu và hợp đồng API

Thiết kế bảng, FK/unique/CHECK và 3 endpoint cho ba chức năng chính. Knowledge Assistant giữ owner trên documents; đề tài khác tự chọn entity/quy tắc.

## Các bước

1. Chọn một user story và viết đầu vào/đầu ra/ca lỗi trước khi code.
2. Vẽ dữ liệu và quy tắc, triển khai một lát chức năng chạy được.
3. Chạy P2.1–P2.4, sau đó test trên dữ liệu của dự án, không lấy output tham chiếu làm bằng chứng tự làm.
4. Lưu commit, lệnh chạy, expected/actual, demo và một quyết định thiết kế kèm phương án đã cân nhắc.

## Tiêu chí và bằng chứng

Request/response/status rõ; truy vấn JOIN cả ca không có hàng; transaction lỗi rollback; restart vẫn đọc được dữ liệu.

Đánh giá dựa trên kỹ năng, không bắt mô hình dữ liệu giống dự án mẫu. Chưa chạy một phần thì ghi rõ còn thiếu. Xem [dự án mẫu](../../docs/PROJECT.md) và [dự án của tôi](../../docs/MY_PROJECT.md).
