# SQL02 — Transaction và rollback

## Mục tiêu và kiến thức trước

Gộp nhiều thay đổi thành một đơn vị thành công hoặc thất bại.

**Cần biết trước:** SQL01; exception và trạng thái trước/sau.

## Tình huống

Chuyển ngân sách gồm trừ một tài khoản và cộng tài khoản khác; lỗi ở bước sau phải hoàn lại bước đầu.

## Ví dụ chạy được

Lệnh từ gốc repository: `py learning/examples/SQL02.py`. Java cần JDK 17+; ví dụ Python dùng thư viện chuẩn.

```python
import sqlite3
db=sqlite3.connect(":memory:")
db.executescript("CREATE TABLE wallets(id INTEGER PRIMARY KEY,balance INTEGER CHECK(balance>=0)); INSERT INTO wallets VALUES(1,10),(2,5);")
try:
    with db:
        db.execute("UPDATE wallets SET balance=balance-4 WHERE id=1")
        db.execute("UPDATE wallets SET balance=-1 WHERE id=2")
except sqlite3.IntegrityError:
    print("rollback")
print(db.execute("SELECT balance FROM wallets ORDER BY id").fetchall())
db.close()
```

**Diễn giải từng bước:**

1. with db mở phạm vi commit/rollback; bước đầu trừ 4.
2. CHECK ở bước hai thất bại và exception thoát phạm vi transaction.
3. Rollback đưa cả hai balance về trước thao tác. Dùng transaction và ca concurrent PostgreSQL ở bài thật.

**Kết quả:**

```text
rollback
[(10,), (5,)]
```

## Lỗi thường gặp

**Nhận biết:** Bắt lỗi bên trong rồi commit khiến số dư chỉ bị trừ; mất dữ liệu sau request lỗi.

**Cách sửa:** Để exception kích hoạt rollback; transaction không tự giải quyết mọi race, kiểm row/version và isolation.

## Kiểm tra hiểu bài

Nếu bắt lỗi bước hai bên trong with mà không rollback thì bước đầu có thể lưu không?

Viết dự đoán và lý do trước khi mở đáp án. Thay một đầu vào trong ví dụ, dự đoán lại rồi chạy.

## Thực hành liên quan

P2.4, JP14. Mở đề, kiểm tiên quyết, dùng gợi ý từng mức nếu cần; lưu expected/actual và output của lệnh kiểm tra. Không dùng kết quả của ví dụ hoặc solution để thay bằng chứng trên bài tự làm.
