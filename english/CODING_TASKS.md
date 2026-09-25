# Tiếng Anh dùng ngay trong mỗi bài lập trình

Mục tiêu: đọc hợp đồng, mô tả thay đổi, giải thích lựa chọn. Các ví dụ dưới đây do người soạn viết; không phải trích nguyên văn tài liệu. Giọng văn trung tính trong giao tiếp kỹ thuật.

Mỗi bài cần: đọc đoạn theo phase trong `READING_PRACTICE.md`, gạch 3 từ chưa biết, viết 1 commit message và giải thích 3–5 câu. Sau đó đối chiếu mẫu. Không chép mẫu nếu mã của bạn chưa thực hiện hành vi đó.

| Phase | Nhiệm vụ đọc / câu hỏi | Commit mẫu | Mẫu giải thích 3 câu |
| --- | --- | --- | --- |
| 0 | Phân biệt compile và run trong thông báo IDE | `fix: correct the array loop boundary` | “I reproduced an array index error. The loop accessed an index equal to the array length. I changed the condition and checked an empty array.” |
| 1 | Đọc API của Map: putIfAbsent trả gì khi đã có key? | `feat: reject duplicate document IDs` | “I store documents in a map. The method rejects an ID that already exists. The original document remains unchanged.” |
| 2 | Đọc LEFT JOIN: dòng không khớp có giá trị gì ở bảng phải? | `feat: include users without documents` | “I used a left join to include every user. I counted document IDs instead of rows. A user without documents has a count of zero.” |
| 3 | Đọc transaction: boundary ở public service method nào? | `fix: roll back document creation when audit fails` | “The service writes the document and its audit record in one transaction. An audit failure causes the transaction to roll back. The integration test checks that no new document remains.” |
| 4 | Đọc authentication/authorization rồi tìm 2 test khác nhau | `test: reject access by another owner` | “Authentication identifies the caller. Authorization checks whether that caller may read the document. The test uses a second user to verify isolation.” |
| 5 | Đọc throws/returns và chính sách retry trong đề | `fix: limit model retries to two attempts` | “I retry only the transient failures allowed by the policy. The operation makes at most two attempts. Invalid input is rejected before the model is called.” |
| 6 | Đọc citation/retrieval và xác định nguồn nào được cấp quyền | `feat: validate retrieved source IDs` | “I filter documents by their owner before selecting the top results. The response cites only retrieved source IDs. If no evidence is available, the service returns insufficient context.” |

## Sửa những câu dễ viết sai

| Câu cần sửa | Câu sửa | Quy tắc |
| --- | --- | --- |
| `I use HashMap for count words.` | `I use a HashMap to count words.` | to + động từ diễn tả mục đích |
| `This method return a list.` | `This method returns a list.` | Chủ ngữ số ít ở hiện tại: returns |
| `The test is pass.` | `The test passes.` / `The test passed.` | passes: hiện tại; passed: lượt chạy đã xong |
| `User can access to the document.` | `The user can access the document.` | Động từ access nhận tân ngữ trực tiếp |
| `It depend of the input.` | `It depends on the input.` | depends on |
| `I fixed bug by use long.` | `I fixed the bug by using long arithmetic.` | by + V-ing |
| `The model always gives true information.` | `The output still requires factual verification.` | Không khẳng định mức bảo đảm chưa kiểm chứng |

## Cặp từ, mẹo nhớ và một câu chứa cả hai

| Cặp | Phân biệt | Mẹo nhớ | Câu dùng cả hai |
| --- | --- | --- | --- |
| compile / run | biên dịch / chạy chương trình | compile tạo mã để run | “Compile the source before you run the program.” |
| expected / actual | kết quả mong đợi / kết quả thực nhận | expected=đề; actual=lần chạy | “The actual output differs from the expected output.” |
| attempt / retry | mọi lần thử / lần thử lại sau lần đầu | 2 attempts = tối đa 1 retry | “The second attempt is the first retry.” |
| invariant / edge case | điều kiện luôn giữ trong thuật toán / tình huống biên | invariant giữ; edge case thử | “This edge case checks whether the invariant still holds.” |
| stale / current | dữ liệu cũ không còn phản ánh hiện tại / phiên bản hiện tại | stale đã cũ; current đang dùng | “Replace stale chunks with chunks from the current document version.” |
| fixture / evidence | dữ liệu hoặc thiết lập kiểm thử / bằng chứng | fixture tạo điều kiện; evidence ghi kết quả | “The fixture is synthetic, so it is not evidence of real model quality.” |

Những từ này hợp trong ngữ cảnh kỹ thuật. Trong IELTS Task 2, chỉ dùng thuật ngữ chuyên môn khi chủ đề và người đọc phù hợp; `attempt`, `evidence`, `current`, `expected` có phạm vi sử dụng rộng hơn.

## Mẫu dùng với mọi DSA

1. “The function returns …” — đầu ra theo hợp đồng.
2. “I keep … in a …” — dữ liệu và cấu trúc.
3. “The invariant is …” — điều luôn đúng.
4. “The time complexity is … because …” — kèm lý do.
5. “I checked …” — một input biên đã thực sự chạy.

Sau khi viết, kiểm tra: có chủ ngữ, động từ đúng thì, thuật ngữ nhất quán, không dùng “always”/“guarantees” nếu test không chứng minh được.