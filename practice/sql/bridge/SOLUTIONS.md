# Đối chiếu sau khi thử ba bài SQL

## SQLB01 — Lọc đúng owner và biên ngày

```sql
CREATE TEMP VIEW bridge_filtered AS
SELECT d.id,d.created_at
FROM bridge_document d CROSS JOIN bridge_request r
WHERE d.owner_id=r.owner_id AND d.created_at>=r.since_at;
```

Hai điều kiện đều phải đúng. `>=` giữ tài liệu tại biên; WHERE không tự bảo đảm thứ tự. Dùng `ORDER BY created_at DESC,id DESC` trong SELECT hiển thị. [File chạy được](SQLB01.solution.sql).

Ví dụ giải thích: “The WHERE clause keeps documents owned by the requested user and created on or after the boundary.”

## SQLB02 — Đếm và giữ người có 0 tài liệu

```sql
CREATE TEMP VIEW bridge_counts AS
SELECT u.id AS user_id,COUNT(d.id) AS document_count
FROM bridge_user u LEFT JOIN bridge_document d ON d.owner_id=u.id
GROUP BY u.id;
```

User không khớp có hàng đệm với `d.id=NULL`. COUNT(cột) bỏ null nên Chi được 0; COUNT(*) sẽ đếm hàng đệm thành 1. [File chạy được](SQLB02.solution.sql).

Ví dụ giải thích: “LEFT JOIN retains users without documents. COUNT(d.id) ignores the null placeholder.”

## SQLB03 — Cursor có hai khóa

```sql
CREATE TEMP VIEW bridge_page AS
SELECT d.id,d.created_at
FROM bridge_document d CROSS JOIN bridge_request r
WHERE d.owner_id=r.owner_id AND (d.created_at,d.id)<(r.cursor_at,r.cursor_id)
ORDER BY d.created_at DESC,d.id DESC
LIMIT (SELECT page_size FROM bridge_request);
```

Cặp khóa so lần lượt: thời gian nhỏ hơn, hoặc cùng thời gian và ID nhỏ hơn. Không dùng offset. Sort trước LIMIT quyết định **những hàng được chọn**; SELECT hiển thị cũng nên nêu ORDER BY. [File chạy được](SQLB03.solution.sql).

Ví dụ giải thích: “The ID breaks timestamp ties. The strict cursor comparison excludes the previous page's last row.”
