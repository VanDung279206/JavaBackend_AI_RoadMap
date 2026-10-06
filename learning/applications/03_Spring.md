# Mốc backend chạy được

Chuyển hợp đồng sang controller/service/repository; DTO riêng và validation; dùng persistence, paging và version.

## Các bước

1. Chọn một user story và viết đầu vào/đầu ra/ca lỗi trước khi code.
2. Vẽ dữ liệu và quy tắc, triển khai một lát chức năng chạy được.
3. Chạy P3.1–P3.4, sau đó test trên dữ liệu của dự án, không lấy output tham chiếu làm bằng chứng tự làm.
4. Lưu commit, lệnh chạy, expected/actual, demo và một quyết định thiết kế kèm phương án đã cân nhắc.

## Tiêu chí và bằng chứng

Test HTTP và dữ liệu sau lỗi; constructor injection test với fake; chứng minh stale update bằng hai request cùng version.

Đánh giá dựa trên kỹ năng, không bắt mô hình dữ liệu giống dự án mẫu. Chưa chạy một phần thì ghi rõ còn thiếu. Xem [dự án mẫu](../../docs/PROJECT.md) và [dự án của tôi](../../docs/MY_PROJECT.md).
