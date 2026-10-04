# Phase 6 — RAG và đánh giá

Vector và tài liệu bên dưới là dữ liệu giả lập để hiểu phép tính. Chúng không được sinh từ embedding model. Xem [lời giải](SOLUTIONS.md). DSA hỗ trợ: D09, D10.

## P6.1 — Chia đoạn có phần chồng lặp · Cơ bản

Chia văn bản theo từ tách bằng khoảng trắng. Với `"a b c d e f g"`, size=4, overlap=1, kết quả là `["a b c d", "d e f g"]`. Đoạn cuối chạm hết văn bản thì dừng. Văn bản trắng → danh sách rỗng. Từ chối size<=0, overlap<0 hoặc overlap>=size.

Giải thích vì sao các “từ” của bài không đồng nghĩa với token của model.

## P6.2 — Lọc quyền trước khi lấy top-k · Trung bình

Query vector `[1,0]`. Có ba đoạn: A thuộc user 1, vector `[1,0]`; B thuộc user 1, vector `[0.8,0.6]`; X thuộc user 2, vector `[1,0]`. Với user 1, k=2, trả A rồi B; không được đưa X vào danh sách. Xếp điểm bằng cosine similarity, hòa điểm thì ID tăng dần. Từ chối vector rỗng, sai chiều, zero vector hoặc thành phần không hữu hạn.

## P6.3 — Kiểm tra nguồn và thiếu dữ liệu · Trung bình

Khi các đoạn truy xuất được là A,B: citation `[A]` hợp lệ về ID, `[X]` không hợp lệ, danh sách citation rỗng không hợp lệ. Nếu không có đoạn phù hợp, luồng API trả `INSUFFICIENT_CONTEXT` trước bước sinh câu trả lời. Giải thích vì sao nguồn đúng ID chưa chứng minh câu trả lời đúng.

## P6.4 — Đo retrieval · Trung bình

Gold set là `{A,C}`, retrieved là `[A,B]`, k=2. Tính Precision@2 và Recall@2. Trong bài, mẫu số precision là k, kể cả khi trả ít hơn k; gold rỗng được tách thành nhóm đánh giá “không có đáp án”, không tính recall. IDs retrieved phải không trùng.

Sau đó dùng [bộ câu hỏi mẫu](EVALUATION_SET.md) để thiết kế kiểm tra nguồn, câu không có đáp án và quyền truy cập.

## Đạt phase khi

- [ ] Tính tay được chunking và cosine trên ví dụ.
- [ ] Truy xuất không lẫn tài liệu ngoài quyền.
- [ ] Phân biệt retrieval đúng, câu trả lời đúng và citation đúng.
- [ ] Ghi kết quả từng câu trước/sau thay đổi cấu hình.