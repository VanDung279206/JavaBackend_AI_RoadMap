# SQL01 — Truy vấn từng bước, JOIN và ràng buộc

## Mục tiêu và kiến thức trước

Trace FROM → JOIN → WHERE → GROUP BY; hiểu unique/FK thay vì lọc lỗi ở ứng dụng.

**Cần biết trước:** HTTP01; bảng, hàng, khóa.

## Tình huống

Bạn cần đếm tài liệu cho mỗi người, bao gồm người chưa có tài liệu.

## Ví dụ chạy được

Lệnh từ gốc repository: `py learning/examples/SQL01.py`. Java cần JDK 17+; ví dụ Python dùng thư viện chuẩn.

```python
import sqlite3
db=sqlite3.connect(":memory:")
db.execute("PRAGMA foreign_keys=ON")
db.executescript("""
CREATE TABLE users(id INTEGER PRIMARY KEY,name TEXT NOT NULL);
CREATE TABLE docs(id INTEGER PRIMARY KEY,owner INTEGER NOT NULL REFERENCES users(id),title TEXT NOT NULL CHECK(length(trim(title))>0));
INSERT INTO users VALUES(1,'An'),(2,'Binh');
INSERT INTO docs VALUES(10,1,'Java'),(11,1,'SQL');
""")
rows=db.execute("SELECT u.name,count(d.id) FROM users u LEFT JOIN docs d ON d.owner=u.id GROUP BY u.id,u.name ORDER BY u.id").fetchall()
print(rows)
try:
    db.execute("INSERT INTO docs VALUES(10,2,'Duplicate')")
except sqlite3.IntegrityError:
    print("duplicate rejected")
db.close()
```

**Diễn giải từng bước:**

1. SQLite in-memory minh họa SQL chuẩn bằng thư viện Python; bài PostgreSQL thật dùng fixture ở practice/sql.
2. LEFT JOIN giữ cả Binh với d.id null; COUNT(d.id) chỉ đếm ID không null.
3. GROUP BY tạo một nhóm mỗi user; PRIMARY KEY từ chối ID trùng trước lưu.

**Kết quả:**

```text
[('An', 2), ('Binh', 0)]
duplicate rejected
```

## Lỗi thường gặp

**Nhận biết:** INNER JOIN mất người có 0 tài liệu; COUNT(*) cho người vắng tài liệu thành 1.

**Cách sửa:** LEFT JOIN và COUNT(d.id). FK ngăn owner không tồn tại; CHECK/NOT NULL ngăn dữ liệu thiếu.

## Kiểm tra hiểu bài

Đổi COUNT(d.id) thành COUNT(*) thì Binh bằng bao nhiêu?

Viết dự đoán và lý do trước khi mở đáp án. Thay một đầu vào trong ví dụ, dự đoán lại rồi chạy.

## Thực hành liên quan

P2.2, P2.3. Mở đề, kiểm tiên quyết, dùng gợi ý từng mức nếu cần; lưu expected/actual và output của lệnh kiểm tra. Không dùng kết quả của ví dụ hoặc solution để thay bằng chứng trên bài tự làm.
