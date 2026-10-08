# Học theo buổi, dùng gợi ý có kiểm soát

32 buổi gợi ý, không phải cam kết thời gian hoàn thành. Mỗi buổi gồm phần bắt buộc 45–60 phút và mở rộng 20–30 phút; chia nhỏ nếu chưa xong. Chỉ chuyển tiếp khi giải thích được đầu ra; có thể đọc trước bài lý thuyết khi công cụ đang BLOCKED nhưng chưa đánh dấu hoàn thành phần chạy.

```bash
python3 scripts/learn.py next
python3 scripts/learn.py show S03
python3 scripts/learn.py hint P1.1 --level 1
python3 scripts/learn.py hint P1.1 --level 2
python3 scripts/learn.py hint P1.1 --level 3
python3 scripts/learn.py done S03 --evidence "điền file/commit và kết quả thực tế"
```

Catalogue hiện có gợi ý ba cấp cho mọi bài, bao gồm JP01–JP20. Cấp 1 đặt câu hỏi, cấp 2 chỉ hướng trace, cấp 3 gợi cách triển khai. CLI chỉ in cấp đã chọn. Tự thử 10–15 phút trước khi tăng cấp; sau cấp 3 mới đối chiếu solution. Khi ghi review khai báo `--hint 1|2|3`; đã đọc solution đầy đủ cũng ghi `--hint 3` và mô tả trong evidence.

`done` chỉ ghi bằng chứng do bạn cung cấp, không tự chấm code hay tăng mastery. `next` dựa trên buổi chưa ghi nhận. Dữ liệu ở `progress/session-state.json`, lịch ôn ở `progress/review-state.json`; dùng `--state` trước subcommand để tạo lịch thử riêng. Không chạy nhiều lệnh ghi chung một file cùng lúc.

## Lịch buổi

| Buổi | Nội dung | Phần bắt buộc | Mở rộng |
| --- | --- | --- | --- |
| S01 | Cài công cụ và chạy Java | P0.1–P0.2; chạy doctor offline và HelloRoadmap. Bài: P0.1, P0.2. | Giải thích JDK/JRE/compiler bằng 3 câu tiếng Anh. |
| S02 | Debug và commit đầu tiên | P0.3–P0.4; tái hiện lỗi, đặt breakpoint, sửa và commit. Bài: P0.3, P0.4. | Làm B01 sau khi hiểu map. |
| S03 | Trace, phương thức và object | Bài học: [JAVA01](lessons/JAVA01.md), [JAVA02](lessons/JAVA02.md), [JAVA03](lessons/JAVA03.md). Đọc JAVA01–JAVA03; dự đoán trước khi chạy; hoàn thiện JP01–JP03 rồi P1.1. Bài: JP01, JP02, JP03, P1.1. | JP18 khi đã hiểu long. |
| S04 | Collections trước danh mục | Bài học: [JAVA04](lessons/JAVA04.md), [JAVA05](lessons/JAVA05.md), [JAVA06](lessons/JAVA06.md), [JAVA07](lessons/JAVA07.md). Đọc JAVA04–JAVA07; JP04–JP09 chia thành các phiên nhỏ; chỉ làm P1.2 sau kiểm ID trùng và snapshot. Bài: JP04, JP05, JP06, JP07, JP08, JP09, P1.2. | JP17 để tái hiện lỗi xóa liên tiếp. |
| S05 | Exception, file và báo cáo | Bài học: [JAVA08](lessons/JAVA08.md). Đọc JAVA08; đổi tiêu đề, parse ID, file UTF-8; nối Map vào báo cáo. Bài: JP10, JP11, JP12, JP16, P1.3. | JP18; J01/J03 để ôn sâu. |
| S06 | Tích hợp danh mục chạy lại được | Bài học: [JAVA05](lessons/JAVA05.md), [JAVA06](lessons/JAVA06.md), [JAVA07](lessons/JAVA07.md), [JAVA08](lessons/JAVA08.md). Tìm/sort, nhập batch nguyên tử, save/load; debug JP17–JP18; hoàn thiện Catalog CLI hoặc mốc Java dự án riêng; tự chấm exams/P1.md. Bài: JP13, JP14, JP15, JP17, JP18, P1.4. | JP19 rồi JP20 chỉ sau đủ tiên quyết; chuyển sang nhánh concurrency nếu muốn. |
| S07 | P2.1 — Hợp đồng API | Bài học: [HTTP01](lessons/HTTP01.md). Ôn một bài đến hạn trong 5–10 phút; làm P2.1 trong starter; cuối buổi viết 3 câu tiếng Anh mô tả lỗi/cách sửa. Bài: P2.1. | Làm D05; cuối mỗi phase tự chấm đề exams/P2.md trong một buổi riêng nếu cần. |
| S08 | P2.2 — Schema và đếm tài liệu | Bài học: [SQL01](lessons/SQL01.md). Ôn một bài đến hạn trong 5–10 phút; làm P2.2 trong starter; cuối buổi viết 3 câu tiếng Anh mô tả lỗi/cách sửa. Bài: P2.2. | Làm D06; cuối mỗi phase tự chấm đề exams/P2.md trong một buổi riêng nếu cần. |
| S09 | P2.3 — Phân trang và index | Bài học: [SQL01](lessons/SQL01.md). Ôn một bài đến hạn trong 5–10 phút; làm P2.3 trong starter; cuối buổi viết 3 câu tiếng Anh mô tả lỗi/cách sửa. Bài: P2.3. | Làm D07; cuối mỗi phase tự chấm đề exams/P2.md trong một buổi riêng nếu cần. |
| S10 | P2.4 — Transaction | Bài học: [SQL02](lessons/SQL02.md). Ôn một bài đến hạn trong 5–10 phút; làm P2.4 trong starter; cuối buổi viết 3 câu tiếng Anh mô tả lỗi/cách sửa. Bài: P2.4. | Làm D08; cuối mỗi phase tự chấm đề exams/P2.md trong một buổi riêng nếu cần. |
| S11 | P3.1 — DTO và validation | Bài học: [SPRING01](lessons/SPRING01.md). Ôn một bài đến hạn trong 5–10 phút; làm P3.1 trong starter; cuối buổi viết 3 câu tiếng Anh mô tả lỗi/cách sửa. Bài: P3.1. | Làm D09; cuối mỗi phase tự chấm đề exams/P3.md trong một buổi riêng nếu cần. |
| S12 | P3.2 — Repository có phạm vi người dùng | Bài học: [SPRING02](lessons/SPRING02.md). Ôn một bài đến hạn trong 5–10 phút; làm P3.2 trong starter; cuối buổi viết 3 câu tiếng Anh mô tả lỗi/cách sửa. Bài: P3.2. | Làm D10; cuối mỗi phase tự chấm đề exams/P3.md trong một buổi riêng nếu cần. |
| S13 | P3.3 — Phân trang và lỗi rõ ràng | Bài học: [SPRING03](lessons/SPRING03.md). Ôn một bài đến hạn trong 5–10 phút; làm P3.3 trong starter; cuối buổi viết 3 câu tiếng Anh mô tả lỗi/cách sửa. Bài: P3.3. | Làm D11; cuối mỗi phase tự chấm đề exams/P3.md trong một buổi riêng nếu cần. |
| S14 | P3.4 — Giao dịch nghiệp vụ | Bài học: [SPRING03](lessons/SPRING03.md). Ôn một bài đến hạn trong 5–10 phút; làm P3.4 trong starter; cuối buổi viết 3 câu tiếng Anh mô tả lỗi/cách sửa. Bài: P3.4. | Làm D12; cuối mỗi phase tự chấm đề exams/P3.md trong một buổi riêng nếu cần. |
| S15 | P4.1 — Hai người dùng | Bài học: [QUALITY01](lessons/QUALITY01.md). Ôn một bài đến hạn trong 5–10 phút; làm P4.1 trong starter; cuối buổi viết 3 câu tiếng Anh mô tả lỗi/cách sửa. Bài: P4.1. | Làm B03; cuối mỗi phase tự chấm đề exams/P4.md trong một buổi riêng nếu cần. |
| S16 | P4.2 — Kiểm thử bắt được lỗi | Bài học: [QUALITY02](lessons/QUALITY02.md). Ôn một bài đến hạn trong 5–10 phút; làm P4.2 trong starter; cuối buổi viết 3 câu tiếng Anh mô tả lỗi/cách sửa. Bài: P4.2. | Làm B02; cuối mỗi phase tự chấm đề exams/P4.md trong một buổi riêng nếu cần. |
| S17 | P4.3 — Đóng gói và cấu hình | Bài học: [QUALITY03](lessons/QUALITY03.md). Ôn một bài đến hạn trong 5–10 phút; làm P4.3 trong starter; cuối buổi viết 3 câu tiếng Anh mô tả lỗi/cách sửa. Bài: P4.3. | Làm B01; cuối mỗi phase tự chấm đề exams/P4.md trong một buổi riêng nếu cần. |
| S18 | P4.4 — Quy trình CI có tiêu chí | Bài học: [QUALITY03](lessons/QUALITY03.md). Ôn một bài đến hạn trong 5–10 phút; làm P4.4 trong starter; cuối buổi viết 3 câu tiếng Anh mô tả lỗi/cách sửa. Bài: P4.4. | Làm B08; cuối mỗi phase tự chấm đề exams/P4.md trong một buổi riêng nếu cần. |
| S19 | P5.1 — Tách chỉ dẫn và dữ liệu | Bài học: [AI01](lessons/AI01.md). Ôn một bài đến hạn trong 5–10 phút; làm P5.1 trong starter; cuối buổi viết 3 câu tiếng Anh mô tả lỗi/cách sửa. Bài: P5.1. | Làm B04; cuối mỗi phase tự chấm đề exams/P5.md trong một buổi riêng nếu cần. |
| S20 | P5.2 — Ngân sách context | Bài học: [AI01](lessons/AI01.md). Ôn một bài đến hạn trong 5–10 phút; làm P5.2 trong starter; cuối buổi viết 3 câu tiếng Anh mô tả lỗi/cách sửa. Bài: P5.2. | Làm B07; cuối mỗi phase tự chấm đề exams/P5.md trong một buổi riêng nếu cần. |
| S21 | P5.3 — Kiểm tra đầu ra có cấu trúc | Bài học: [AI02](lessons/AI02.md). Ôn một bài đến hạn trong 5–10 phút; làm P5.3 trong starter; cuối buổi viết 3 câu tiếng Anh mô tả lỗi/cách sửa. Bài: P5.3. | Làm B06; cuối mỗi phase tự chấm đề exams/P5.md trong một buổi riêng nếu cần. |
| S22 | P5.4 — Lỗi tạm thời và retry hữu hạn | Bài học: [AI03](lessons/AI03.md). Ôn một bài đến hạn trong 5–10 phút; làm P5.4 trong starter; cuối buổi viết 3 câu tiếng Anh mô tả lỗi/cách sửa. Bài: P5.4. | Làm B08; cuối mỗi phase tự chấm đề exams/P5.md trong một buổi riêng nếu cần. |
| S23 | P6.1 — Chia đoạn có phần chồng lặp | Bài học: [RAG01](lessons/RAG01.md). Ôn một bài đến hạn trong 5–10 phút; làm P6.1 trong starter; cuối buổi viết 3 câu tiếng Anh mô tả lỗi/cách sửa. Bài: P6.1. | Làm V04; cuối mỗi phase tự chấm đề exams/P6.md trong một buổi riêng nếu cần. |
| S24 | P6.2 — Lọc quyền trước khi lấy top-k | Bài học: [RAG02](lessons/RAG02.md). Ôn một bài đến hạn trong 5–10 phút; làm P6.2 trong starter; cuối buổi viết 3 câu tiếng Anh mô tả lỗi/cách sửa. Bài: P6.2. | Làm V08; cuối mỗi phase tự chấm đề exams/P6.md trong một buổi riêng nếu cần. |
| S25 | P6.3 — Kiểm tra nguồn và thiếu dữ liệu | Bài học: [RAG03](lessons/RAG03.md). Ôn một bài đến hạn trong 5–10 phút; làm P6.3 trong starter; cuối buổi viết 3 câu tiếng Anh mô tả lỗi/cách sửa. Bài: P6.3. | Làm V09; cuối mỗi phase tự chấm đề exams/P6.md trong một buổi riêng nếu cần. |
| S26 | P6.4 — Đo retrieval | Bài học: [RAG02](lessons/RAG02.md), [RAG03](lessons/RAG03.md). Ôn một bài đến hạn trong 5–10 phút; làm P6.4 trong starter; cuối buổi viết 3 câu tiếng Anh mô tả lỗi/cách sửa. Bài: P6.4. | Làm V10; cuối mỗi phase tự chấm đề exams/P6.md trong một buổi riêng nếu cần. |
| S27 | Liên kết, cây và đồ thị | D13,D14,D15; có thể chia thành ba buổi nhỏ. Bài: D13, D14, D15. | Làm V11,V12 rồi ghi một lỗi có tag. |
| S28 | Hai yêu cầu đồng thời | Bài học: [JAVA06](lessons/JAVA06.md), [SPRING03](lessons/SPRING03.md). C01,C02 trong concurrency/starter. Bài: C01, C02. | Đọc ConcurrentIT của app; chạy PostgreSQL integration khi đủ môi trường. |
| S29 | Timeout và đọc lỗi | Bài học: [AI03](lessons/AI03.md). C03; đọc E01–E04 trong English error clinic. Bài: C03. | Đọc E05–E08 và kiểm tra model thật theo RUNNING. |
| S30 | Bài DSA trộn A | M01–M04; đọc đề không mở lời giải; có thể chia hai buổi. Bài: M01, M02, M03, M04. | Đổi seed của test; tự tạo input phản ví dụ. |
| S31 | Bài DSA trộn B | M05–M08; giải thích vì sao bỏ một hướng khác. Bài: M05, M06, M07, M08. | Làm lại bài sai sau một ngày bằng dữ liệu khác. |
| S32 | Chứng minh dự án cuối | Chạy lại dự án mẫu hoặc dự án riêng từ clone sạch; nộp repository, test, hướng dẫn chạy, demo và quyết định thiết kế. Chấm theo kỹ năng chung trong docs/MY_PROJECT.md; RAG có thể nộp lab riêng. Bài: . | Tự chạy lại từ bản clone sạch; kiểm tra evidence không chứa secrets. |

## Ôn theo lỗi

```bash
python3 scripts/review.py tags
python3 scripts/review.py record P3.3 --result fail --tags overflow,off-by-one --hint 1 --evidence "offset âm với page lớn; chưa sửa"
python3 scripts/review.py due
python3 scripts/review.py recommend --limit 5
```

Bài fail trở lại sau 1 ngày và bắt đầu lại khoảng cách; partial hoặc pass có gợi ý cũng ôn sau 1 ngày, không tăng stage. Pass không gợi ý ở ngày mới tăng khoảng cách theo 1,3,7,14,30 ngày; lần ghi cùng ngày không tăng stage. Đây là quy tắc của công cụ, chưa phải mô hình ghi nhớ được hiệu chỉnh cho cá nhân.

Tag đang mắc được chấm ưu tiên: fail=3, partial/pass có hỗ trợ=1 mỗi bài; cộng theo tag liên quan để gợi ý bài khác. Cùng điểm thì ưu tiên bài chưa làm, sau đó ID. Điểm này chỉ xếp thứ tự bài, không phải xác suất quên. Pass không gợi ý xóa tag đang mắc của bài đó, lịch sử cũ vẫn giữ. Đọc yêu cầu trước khi chọn bài thuộc phase chưa học. Dữ liệu v2 dạng dictionary được giữ lại; công cụ không ghi gì cho đến lệnh record/done.

## Học chặng này và Java thí điểm

Mỗi chặng 1–6 có **Bài học → Luyện tập → Áp dụng vào dự án → Kiểm tra cuối chặng** trên `/learn/<phase>`. Nguồn bài học trong [courses.json](courses.json), ví dụ độc lập ở [examples](examples), và [20 bài Java](../java-pilot/EXERCISES.md). S03–S06 giữ lịch 32 mốc, nhưng mỗi mốc Java có thể cần nhiều phiên 45–60 phút; không coi 20 bài là bốn buổi cố định. JP19–JP20 là nhánh lựa chọn sau đủ tiên quyết. S07–S32 giữ bài hiện có; ôn bài học chặng tương ứng trước bài tập.

Theo dõi riêng đã đọc, đã làm bài và đã đối chiếu kết quả với bằng chứng. Bằng chứng nhập trên thiết bị là tự đối chiếu; chỉ worker kiểm thử mới cấp verified PASS. Bài sai/tag lỗi dẫn về bài học liên quan. Chọn dự án mẫu hoặc [dự án của tôi](../docs/MY_PROJECT.md); RAG có thể là lab độc lập nếu không phù hợp sản phẩm.

Sau thí điểm, ghi thời gian, số lần dùng gợi ý, lỗi phổ biến và khả năng tự làm lại sau một tuần; dùng kết quả thực tế để sửa bài nối mức trước khi mở rộng số lượng.
