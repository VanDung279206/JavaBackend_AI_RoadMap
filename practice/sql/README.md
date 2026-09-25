# Thực hành PostgreSQL P2.2–P2.4

Cần PostgreSQL và `psql`. `DATABASE_URL` trỏ tới database học tập; không chạy trên database công việc.

```bash
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f practice/sql/fixture.sql -f practice/sql/starter.sql -f practice/sql/tests.sql
```

PowerShell: dùng `$env:DATABASE_URL` thay `"$DATABASE_URL"`. Xem bản tham chiếu bằng cách thay `starter.sql` bằng `solution.sql`.

Ba file chạy trong cùng connection vì dùng TEMP table. Không bọc toàn bộ lệnh bằng `--single-transaction`: P2.4 cần tự quản lý COMMIT/ROLLBACK. Ban đầu counts=[2,1,0]; sau khi P2.4 commit tài liệu 104, view counts phải thành [3,1,0]. Fixture này và fixture phase 2 cũ chạy trong các phiên riêng.

Test kiểm tra kết quả truy vấn và trạng thái cuối. Người học vẫn cần ghi bằng chứng đã thực sự thử rollback (trạng thái cuối đơn thuần không chứng minh thao tác rollback đã được thực hiện). Kiểm thử Spring `TransactionIT` bổ sung trường hợp lỗi audit làm rollback cả document.
