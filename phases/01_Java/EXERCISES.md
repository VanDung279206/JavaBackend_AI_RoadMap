# Phase 1 — Java Core

Đọc đề, tự viết mã, rồi mới mở [lời giải](SOLUTIONS.md). Các đầu vào bên dưới là dữ liệu bài tập. DSA đi kèm: D01–D04 trong [bộ DSA](../../dsa/EXERCISES.md).

## P1.1 — Chuẩn hóa tiêu đề · Cơ bản

Viết `normalizeTitle(String raw)`: bỏ khoảng trắng đầu/cuối, gộp nhiều dấu cách/tab/xuống dòng ở giữa thành một dấu cách. Từ chối `null` và chuỗi rỗng sau chuẩn hóa bằng `IllegalArgumentException`. Không thay đổi chữ hoa/thường. Bài dùng khoảng trắng ASCII ở giữa chuỗi.

| Input | Kết quả |
| --- | --- |
| `"  Java   Backend  "` | `"Java Backend"` |
| `"AI\tRoadmap"` | `"AI Roadmap"` |
| `"   "` hoặc `null` | Ném exception |

Gợi ý: kiểm tra null trước khi gọi phương thức trên chuỗi. Tự kiểm tra: vì sao `raw == ""` không phải cách kiểm tra chuỗi rỗng phù hợp?

## P1.2 — Danh mục tài liệu · Cơ bản

Tạo `Document(id, title, content)` và `Catalog` với `add`, `find`, `all`, `remove`. ID phải dương, tiêu đề theo P1.1, nội dung không null. ID trùng phải bị từ chối; xóa ID không có trả `false`; tìm không thấy trả `Optional.empty()`; kết quả `all()` giữ thứ tự thêm và không cho bên ngoài sửa cấu trúc danh mục.

Ví dụ: thêm ID 1, thêm lại ID 1 → exception; `find(99)` → empty; `remove(99)` → false. Tự kiểm tra: trả trực tiếp `map.values()` sẽ tạo quan hệ gì giữa người gọi và dữ liệu bên trong?

## P1.3 — Đếm từ theo hợp đồng rõ ràng · Trung bình

Viết `wordCounts`: chuyển chữ thường với `Locale.ROOT`, tách theo khoảng trắng, giữ nguyên dấu câu. Kết quả sắp theo từ. Ví dụ `"Java java AI"` → `{ai=1, java=2}`; `"java, java"` → hai khóa `java,` và `java`; chuỗi trắng → map rỗng. `null` nằm ngoài hợp đồng và bị từ chối.

Gợi ý: `merge` hoặc `getOrDefault`. Tự kiểm tra: vì sao không tự bỏ dấu câu khi đề chưa yêu cầu?

## P1.4 — Tìm và sắp xếp · Trung bình

Viết `search(docs, keyword)`: tìm trong tiêu đề, không phân biệt hoa/thường, trả ID tăng dần. Keyword null hoặc trắng bị từ chối. Danh sách nguồn không bị sửa.

Với `(3,"Java AI"), (1,"Java Core"), (2,"SQL")`, tìm `" java "` → ID `[1,3]`. Thử danh sách rỗng và từ khóa không khớp. Gợi ý: `filter` trước `sorted`.

## Đạt phase khi

- [ ] Viết lại P1.1 và P1.2 không xem lời giải.
- [ ] Chạy được ví dụ và các trường hợp lỗi.
- [ ] Giải thích được vì sao chọn `Map`, `Optional` và bản sao danh sách.
- [ ] Dùng được 10 từ vựng nhóm Phase 1 trong [glossary](../../english/GLOSSARY.md).