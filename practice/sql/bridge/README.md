# Ba bước trước bài SQL tổng hợp

Làm SQLB01 → SQLB02 → SQLB03, mỗi lần chỉ sửa một file `*.starter.sql`. Dự đoán kết quả trước, chạy, đọc assertion đầu tiên, rồi mới mở gợi ý hoặc lời giải. Lưu output thực tế và 2–3 câu giải thích bằng tiếng Anh vào bằng chứng tự đối chiếu.

Cần PostgreSQL 17 và `psql`; dùng database thực hành riêng. Fixture chỉ tạo TEMP table/view, tự hết khi connection đóng; không đặt lại schema của database. Mỗi bài dùng một connection mới và đúng một hàng `bridge_request`. Các test thay đổi dữ liệu/parameters để phát hiện code ghi cứng mẫu.

Từ gốc repo, thay ID tương ứng:

```bash
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f practice/sql/bridge/fixture.sql -f practice/sql/bridge/SQLB01.starter.sql -f practice/sql/bridge/SQLB01.tests.sql
```

PowerShell dùng `$env:DATABASE_URL` thay `"$DATABASE_URL"`. Khi đổi bài, thay **cả hai** ID ở starter và tests. Starter ban đầu chạy được SQL nhưng test phải FAIL; `PASS SQLB01` chỉ xuất hiện khi các assertion đều đạt. Thay `starter` bằng `solution` để chạy tham chiếu; kết quả tham chiếu không xác nhận bài tự làm.

Fixture: An có 101 ngày 01/09, 102 và 104 cùng 02/09, 105 ngày 03/09; Bình có 201 ngày 02/09; Chi chưa có tài liệu. Tất cả timestamp là 00:00 UTC năm 2026.

## SQLB01 — Lọc đúng owner và biên ngày

Tiên quyết: P2.1; SELECT/WHERE trong bài SQL01. Sửa `SQLB01.starter.sql`, tạo view `bridge_filtered(id,created_at)`. Đọc `owner_id` và `since_at` từ hàng request; giữ tài liệu đúng owner với `created_at >= since_at`.

Input mặc định: owner 1, since 02/09. Khi hiển thị bằng `ORDER BY created_at DESC,id DESC`, output phải là `[105,104,102]`. Bình 201 cùng ngày vẫn bị loại; 102/104 ở đúng biên phải được giữ. Owner 2 trả `[201]`; owner 3 và since sau mọi tài liệu trả `[]`. Insert một hàng mới đúng biên phải xuất hiện.

Điền predicate sau `WHERE`, không dùng ID hoặc owner cố định. View này lọc dữ liệu; thứ tự hiển thị do SELECT bên ngoài chỉ định.

Giải thích bằng tiếng Anh: “The WHERE clause keeps … . A document from another owner … . The date boundary is … .”

Đọc lỗi: thiếu 102/104 thường do dùng `>` thay `>=`; lộ 201 thường do dùng `OR` thay `AND`. Chạy lại trong connection mới sau khi sửa.

## SQLB02 — Đếm và giữ người có 0 tài liệu

Tiên quyết: SQLB01. Sửa `SQLB02.starter.sql`, tạo view `bridge_counts(user_id,document_count)`. Mỗi user đúng một hàng; số lượng tính bằng tài liệu thuộc user đó, kể cả khi không có tài liệu.

Input fixture ban đầu → output theo user ID `[(1,4),(2,1),(3,0)]`. Sau thêm user 4 chưa có tài liệu và tài liệu đầu tiên cho Chi → `[(1,4),(2,1),(3,1),(4,0)]`. Xóa mọi tài liệu → cả bốn user vẫn còn, mỗi count bằng 0.

Điền LEFT JOIN và điều kiện owner, chọn cột để COUNT, rồi GROUP BY. Không lọc cột document trong WHERE ở bài này: hàng không khớp phải được giữ.

Giải thích bằng tiếng Anh: “LEFT JOIN keeps … . COUNT(d.id) ignores … . COUNT(*) would … .”

Đọc lỗi: mất Chi là do INNER JOIN hoặc lọc hàng null; count của Chi bằng 1 là do đếm hàng đệm bằng `COUNT(*)`.

## SQLB03 — Cursor có hai khóa

Tiên quyết: SQLB02. Sửa `SQLB03.starter.sql`, tạo view `bridge_page(id,created_at)`. Đọc owner, cursor time/ID và page size từ request. Đây là trang **sau một cursor đã có**, không xử lý cursor null/trang đầu. Lọc owner và cặp khóa **nhỏ hơn nghiêm ngặt** cursor, sắp `created_at DESC,id DESC` rồi LIMIT.

Input: owner 1, cursor (02/09,104), size 2 → `[102,101]`. Thêm 103 cùng ngày và 106 ngày 04/09 → `[103,102]`; thêm hàng trước cursor không làm dịch trang. Size 1 ở cùng cursor → `[103]`. Cursor (02/09,102) → `[101]`, không lặp lại 102. Owner chưa có dữ liệu và bảng rỗng → `[]`.

Điền điều kiện cặp khóa hoặc phép OR tương đương, giữ owner áp dụng cho cả hai nhánh. Thứ tự phải ổn định **trước LIMIT**, không chỉ sort lại kết quả đã cắt. Sau bài này làm P2.3 với hợp đồng API của bạn.

Giải thích bằng tiếng Anh: “The cursor contains … . The ID breaks ties when … . A strict comparison prevents … .”

Đọc lỗi: mất 102 khi cùng timestamp là do chỉ so thời gian; lặp 104 là do dùng `<=`. Query này không hứa snapshot qua nhiều request khi người khác sửa/xóa bản ghi.

Tham khảo [PostgreSQL 17 LEFT JOIN/WHERE](https://www.postgresql.org/docs/17/queries-table-expressions.html), [row comparison](https://www.postgresql.org/docs/17/functions-comparisons.html).
