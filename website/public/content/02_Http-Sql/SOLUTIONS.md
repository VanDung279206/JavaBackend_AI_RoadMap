# Lời giải Phase 2

## P2.1

| Thao tác | Method/path | Thành công | Lỗi theo hợp đồng bài |
| --- | --- | --- | --- |
| Tạo | `POST /documents` | 201, `Location: /documents/103` | 400 nếu title trắng; 401 nếu chưa xác thực |
| Đọc | `GET /documents/103` | 200 và JSON | 401 nếu chưa xác thực; 404 nếu không có hoặc ngoài quyền |
| Xóa | `DELETE /documents/103` | 204, body rỗng | 401 nếu chưa xác thực; 404 nếu không có hoặc ngoài quyền |

Body tạo: `{"title":"Java Core","content":"Notes"}`. Response minh họa: `{"id":103,"title":"Java Core","content":"Notes"}`. ID 103 là dữ liệu giả lập, không phải kết quả chạy database trong môi trường này. Chủ sở hữu lấy từ danh tính đã xác thực phía server. Nếu có ràng buộc nghiệp vụ gây xung đột trạng thái, có thể quy định 409; title trắng là lỗi đầu vào 400 trong bài.

Xóa lần thứ hai có thể trả 404 mà thao tác DELETE vẫn có tính idempotent về hiệu ứng: tài nguyên vẫn không tồn tại. Idempotent không yêu cầu mọi response giống nhau.

## P2.2

Lời giải đầy đủ ở [solution.sql](solution.sql). Dùng `LEFT JOIN` từ người dùng sang tài liệu, rồi `COUNT(d.id)`. Người dùng không có tài liệu tạo dòng ghép với `d.id = NULL`; `COUNT(d.id)` cho 0, còn `COUNT(*)` đếm dòng ghép đó thành 1.

Kỳ vọng: `(1,An,2), (2,Bình,1), (3,Chi,0)`. Khóa ngoại ngăn tài liệu tham chiếu user không tồn tại. `NOT NULL` và `CHECK` kiểm tra tiêu đề ngay tại database.

## P2.3

Cursor mang thời điểm và ID của phần tử cuối. Với thứ tự giảm dần, chọn tuple `(created_at,id)` nhỏ hơn cursor, đồng thời giới hạn `owner_id = 1`. Index đề xuất `(owner_id, created_at DESC, id DESC)` phục vụ điều kiện chủ sở hữu và thứ tự truy vấn này.

ID là tiêu chí phụ để thứ tự xác định khi timestamp trùng. Với dữ liệu thay đổi giữa các lần đọc, cần xác định rõ yêu cầu nhất quán; cursor không tự tạo snapshot cho cả phiên phân trang. Dùng `EXPLAIN (ANALYZE, BUFFERS)` trên dữ liệu đại diện khi đánh giá hiệu năng. Planner có thể chọn quét tuần tự trên bảng nhỏ.

## P2.4

`BEGIN` → hai lệnh INSERT → `ROLLBACK`. Sau rollback, kiểm tra số dòng tài liệu 103 và audit `document_id=103`; cả hai bằng 0 trong fixture. Để thử commit, chạy lại transaction với `COMMIT`, kỳ vọng cả hai bằng 1. Nếu thao tác thứ hai lỗi, ứng dụng phải rollback thay vì lưu một phần nghiệp vụ.

## Chạy lời giải SQL

Trong thư mục phase, với PostgreSQL đã chạy và biến `DATABASE_URL` đã cấu hình, Bash:

```bash
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f solution.sql
```

PowerShell:

```powershell
psql $env:DATABASE_URL -v ON_ERROR_STOP=1 -f solution.sql
```

Script sử dụng bảng tạm trong một phiên kết nối. Các kết quả trên là kết quả kỳ vọng của fixture; xem phạm vi đã kiểm tra trong [VALIDATION.md](../../VALIDATION.md).

Nguồn: [PostgreSQL Transactions](https://www.postgresql.org/docs/current/tutorial-transactions.html), [HTTP Semantics RFC 9110](https://www.rfc-editor.org/rfc/rfc9110.html).