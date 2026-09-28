# Lời giải Phase 6

Mã đầy đủ: [RagLab.java](../../labs/src/RagLab.java). Đây là bài toán vector và quy tắc xử lý trong bộ nhớ; kết nối pgvector và embedding model là bước tích hợp vào dự án chính.

## P6.1

Bước nhảy `step = size - overlap`. Với size=4, overlap=1, bắt đầu ở vị trí 0 rồi 3: `[a,b,c,d]` và `[d,e,f,g]`. Khi end chạm độ dài văn bản, dừng để không thêm một đoạn cuối chỉ lặp lại phần đã có.

Nếu overlap>=size, bước nhảy không dương; do đó phải từ chối trước vòng lặp. Bộ chia theo khoảng trắng phục vụ minh họa. Khi triển khai RAG thật, chọn bộ chia theo cấu trúc tài liệu hoặc tokenizer và lưu metadata nguồn cho từng đoạn.

## P6.2

Cosine similarity:

```text
cos(a,b) = dot(a,b) / (norm(a) * norm(b))
```

Với q=[1,0]: A có điểm 1; B có điểm 0.8 vì norm của `[0.8,0.6]` bằng 1. X có điểm 1 nhưng bị loại trước khi xếp hạng vì khác owner. Kết quả `[A,B]`.

Lọc sau top-k có thể khiến tập kết quả bị chiếm bởi tài liệu ngoài quyền và còn thiếu kết quả hợp lệ. User ID phải được backend suy ra từ principal đã xác thực. Trong bài Java, sắp toàn bộ m đoạn hợp lệ có chi phí O(m log m), ngoài chi phí tính vector; có thể dùng min-heap khi cần top-k trên tập lớn trong bộ nhớ.

Mã dùng chuẩn hóa vector rồi nhân thành phần, đồng thời từ chối vector không hợp lệ. Vector từ các mô hình khác nhau không mặc nhiên so sánh được chỉ vì có cùng số chiều.

## P6.3

Tạo set ID từ các hit; yêu cầu danh sách citation không rỗng và mọi ID đều thuộc set. Hàm này kiểm tra tư cách nguồn trong tập truy xuất. Nó không kiểm tra nguồn có thực sự hỗ trợ từng mệnh đề trong câu trả lời.

Ví dụ A nói “mở cửa 9 giờ”; câu trả lời “mở cửa 8 giờ [A]” vẫn qua kiểm tra ID nhưng sai nội dung. Cần đối chiếu nội dung nguồn trong bộ đánh giá. Nếu truy xuất không có ngữ cảnh phù hợp, hợp đồng đề xuất là:

```json
{"status":"INSUFFICIENT_CONTEXT","answer":null,"sources":[]}
```

Điều kiện “phù hợp” và ngưỡng điểm phải hiệu chỉnh bằng dữ liệu đã gán nhãn; không có ngưỡng cosine dùng đúng cho mọi model và bộ tài liệu.

## P6.4

Trong top-2, chỉ A thuộc gold: có 1 hit liên quan. Precision@2=1/2=0.5; Recall@2=1/2=0.5. Nếu chỉ trả `[A]`, precision vẫn 1/2 theo quy ước mẫu số k của bài; recall vẫn 1/2. Nếu trả `[A,C]`, cả hai bằng 1.

Không đặt recall bằng 1 cho gold rỗng để làm đẹp số liệu. Đánh giá riêng khả năng từ chối trả lời khi thiếu bằng chứng. Retrieval tốt vẫn có thể đi kèm câu trả lời sai; thêm cột độ đúng câu trả lời và độ đúng nguồn, có kiểm tra thủ công.

Nguồn: [Spring AI RAG](https://docs.spring.io/spring-ai/reference/api/retrieval-augmented-generation.html), [PGvector](https://docs.spring.io/spring-ai/reference/api/vectordbs/pgvector.html), [Evaluation Testing](https://docs.spring.io/spring-ai/reference/api/testing.html).