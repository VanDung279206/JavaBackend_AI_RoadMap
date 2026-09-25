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

Gợi ý cho 24 bài phase và 27 bài DSA/biến thể: cấp 1 đặt câu hỏi, cấp 2 trace cụ thể, cấp 3 giả mã. CLI chỉ in cấp đã chọn. Tự thử 10–15 phút trước khi mở cấp tiếp; sau cấp 3 mới đối chiếu solution. CLI không thể biết bạn đã đọc lời giải bên ngoài; khi ghi review hãy khai báo `--hint 1|2|3`. Đọc lời giải đầy đủ cũng ghi `--hint 3` và mô tả trong evidence. Các bài B/C/M dùng đề và lời giải riêng, không nằm trong 51 bộ gợi ý này.

`done` chỉ ghi bằng chứng do bạn cung cấp, không tự chấm code hay tăng mastery. `next` dựa trên buổi chưa ghi nhận. Dữ liệu ở `progress/session-state.json`, lịch ôn ở `progress/review-state.json`; dùng `--state` trước subcommand để tạo lịch thử riêng. Không chạy nhiều lệnh ghi chung một file cùng lúc.

## Lịch buổi

| Buổi | Nội dung | Phần bắt buộc | Mở rộng |
| --- | --- | --- | --- |
| S01 | Cài công cụ và chạy Java | P0.1–P0.2; chạy doctor offline và HelloRoadmap. | Giải thích JDK/JRE/compiler bằng 3 câu tiếng Anh. |
| S02 | Debug và commit đầu tiên | P0.3–P0.4; tái hiện lỗi, đặt breakpoint, sửa và commit. | Làm B01 sau khi hiểu map. |
| S03 | P1.1 — Chuẩn hóa tiêu đề | Ôn một bài đến hạn trong 5–10 phút; làm P1.1 trong starter; cuối buổi viết 3 câu tiếng Anh mô tả lỗi/cách sửa. | Làm D01; cuối mỗi phase tự chấm đề exams/P1.md trong một buổi riêng nếu cần. |
| S04 | P1.2 — Danh mục tài liệu | Ôn một bài đến hạn trong 5–10 phút; làm P1.2 trong starter; cuối buổi viết 3 câu tiếng Anh mô tả lỗi/cách sửa. | Làm D02; cuối mỗi phase tự chấm đề exams/P1.md trong một buổi riêng nếu cần. |
| S05 | P1.3 — Đếm từ theo hợp đồng rõ ràng | Ôn một bài đến hạn trong 5–10 phút; làm P1.3 trong starter; cuối buổi viết 3 câu tiếng Anh mô tả lỗi/cách sửa. | Làm D03; cuối mỗi phase tự chấm đề exams/P1.md trong một buổi riêng nếu cần. |
| S06 | P1.4 — Tìm và sắp xếp | Ôn một bài đến hạn trong 5–10 phút; làm P1.4 trong starter; cuối buổi viết 3 câu tiếng Anh mô tả lỗi/cách sửa. | Làm D04; cuối mỗi phase tự chấm đề exams/P1.md trong một buổi riêng nếu cần. |
| S07 | P2.1 — Hợp đồng API | Ôn một bài đến hạn trong 5–10 phút; làm P2.1 trong starter; cuối buổi viết 3 câu tiếng Anh mô tả lỗi/cách sửa. | Làm D05; cuối mỗi phase tự chấm đề exams/P2.md trong một buổi riêng nếu cần. |
| S08 | P2.2 — Schema và đếm tài liệu | Ôn một bài đến hạn trong 5–10 phút; làm P2.2 trong starter; cuối buổi viết 3 câu tiếng Anh mô tả lỗi/cách sửa. | Làm D06; cuối mỗi phase tự chấm đề exams/P2.md trong một buổi riêng nếu cần. |
| S09 | P2.3 — Phân trang và index | Ôn một bài đến hạn trong 5–10 phút; làm P2.3 trong starter; cuối buổi viết 3 câu tiếng Anh mô tả lỗi/cách sửa. | Làm D07; cuối mỗi phase tự chấm đề exams/P2.md trong một buổi riêng nếu cần. |
| S10 | P2.4 — Transaction | Ôn một bài đến hạn trong 5–10 phút; làm P2.4 trong starter; cuối buổi viết 3 câu tiếng Anh mô tả lỗi/cách sửa. | Làm D08; cuối mỗi phase tự chấm đề exams/P2.md trong một buổi riêng nếu cần. |
| S11 | P3.1 — DTO và validation | Ôn một bài đến hạn trong 5–10 phút; làm P3.1 trong starter; cuối buổi viết 3 câu tiếng Anh mô tả lỗi/cách sửa. | Làm D09; cuối mỗi phase tự chấm đề exams/P3.md trong một buổi riêng nếu cần. |
| S12 | P3.2 — Repository có phạm vi người dùng | Ôn một bài đến hạn trong 5–10 phút; làm P3.2 trong starter; cuối buổi viết 3 câu tiếng Anh mô tả lỗi/cách sửa. | Làm D10; cuối mỗi phase tự chấm đề exams/P3.md trong một buổi riêng nếu cần. |
| S13 | P3.3 — Phân trang và lỗi rõ ràng | Ôn một bài đến hạn trong 5–10 phút; làm P3.3 trong starter; cuối buổi viết 3 câu tiếng Anh mô tả lỗi/cách sửa. | Làm D11; cuối mỗi phase tự chấm đề exams/P3.md trong một buổi riêng nếu cần. |
| S14 | P3.4 — Giao dịch nghiệp vụ | Ôn một bài đến hạn trong 5–10 phút; làm P3.4 trong starter; cuối buổi viết 3 câu tiếng Anh mô tả lỗi/cách sửa. | Làm D12; cuối mỗi phase tự chấm đề exams/P3.md trong một buổi riêng nếu cần. |
| S15 | P4.1 — Hai người dùng | Ôn một bài đến hạn trong 5–10 phút; làm P4.1 trong starter; cuối buổi viết 3 câu tiếng Anh mô tả lỗi/cách sửa. | Làm B03; cuối mỗi phase tự chấm đề exams/P4.md trong một buổi riêng nếu cần. |
| S16 | P4.2 — Kiểm thử bắt được lỗi | Ôn một bài đến hạn trong 5–10 phút; làm P4.2 trong starter; cuối buổi viết 3 câu tiếng Anh mô tả lỗi/cách sửa. | Làm B02; cuối mỗi phase tự chấm đề exams/P4.md trong một buổi riêng nếu cần. |
| S17 | P4.3 — Đóng gói và cấu hình | Ôn một bài đến hạn trong 5–10 phút; làm P4.3 trong starter; cuối buổi viết 3 câu tiếng Anh mô tả lỗi/cách sửa. | Làm B01; cuối mỗi phase tự chấm đề exams/P4.md trong một buổi riêng nếu cần. |
| S18 | P4.4 — Quy trình CI có tiêu chí | Ôn một bài đến hạn trong 5–10 phút; làm P4.4 trong starter; cuối buổi viết 3 câu tiếng Anh mô tả lỗi/cách sửa. | Làm B08; cuối mỗi phase tự chấm đề exams/P4.md trong một buổi riêng nếu cần. |
| S19 | P5.1 — Tách chỉ dẫn và dữ liệu | Ôn một bài đến hạn trong 5–10 phút; làm P5.1 trong starter; cuối buổi viết 3 câu tiếng Anh mô tả lỗi/cách sửa. | Làm B04; cuối mỗi phase tự chấm đề exams/P5.md trong một buổi riêng nếu cần. |
| S20 | P5.2 — Ngân sách context | Ôn một bài đến hạn trong 5–10 phút; làm P5.2 trong starter; cuối buổi viết 3 câu tiếng Anh mô tả lỗi/cách sửa. | Làm B07; cuối mỗi phase tự chấm đề exams/P5.md trong một buổi riêng nếu cần. |
| S21 | P5.3 — Kiểm tra đầu ra có cấu trúc | Ôn một bài đến hạn trong 5–10 phút; làm P5.3 trong starter; cuối buổi viết 3 câu tiếng Anh mô tả lỗi/cách sửa. | Làm B06; cuối mỗi phase tự chấm đề exams/P5.md trong một buổi riêng nếu cần. |
| S22 | P5.4 — Lỗi tạm thời và retry hữu hạn | Ôn một bài đến hạn trong 5–10 phút; làm P5.4 trong starter; cuối buổi viết 3 câu tiếng Anh mô tả lỗi/cách sửa. | Làm B08; cuối mỗi phase tự chấm đề exams/P5.md trong một buổi riêng nếu cần. |
| S23 | P6.1 — Chia đoạn có phần chồng lặp | Ôn một bài đến hạn trong 5–10 phút; làm P6.1 trong starter; cuối buổi viết 3 câu tiếng Anh mô tả lỗi/cách sửa. | Làm V04; cuối mỗi phase tự chấm đề exams/P6.md trong một buổi riêng nếu cần. |
| S24 | P6.2 — Lọc quyền trước khi lấy top-k | Ôn một bài đến hạn trong 5–10 phút; làm P6.2 trong starter; cuối buổi viết 3 câu tiếng Anh mô tả lỗi/cách sửa. | Làm V08; cuối mỗi phase tự chấm đề exams/P6.md trong một buổi riêng nếu cần. |
| S25 | P6.3 — Kiểm tra nguồn và thiếu dữ liệu | Ôn một bài đến hạn trong 5–10 phút; làm P6.3 trong starter; cuối buổi viết 3 câu tiếng Anh mô tả lỗi/cách sửa. | Làm V09; cuối mỗi phase tự chấm đề exams/P6.md trong một buổi riêng nếu cần. |
| S26 | P6.4 — Đo retrieval | Ôn một bài đến hạn trong 5–10 phút; làm P6.4 trong starter; cuối buổi viết 3 câu tiếng Anh mô tả lỗi/cách sửa. | Làm V10; cuối mỗi phase tự chấm đề exams/P6.md trong một buổi riêng nếu cần. |
| S27 | Liên kết, cây và đồ thị | D13,D14,D15; có thể chia thành ba buổi nhỏ. | Làm V11,V12 rồi ghi một lỗi có tag. |
| S28 | Hai yêu cầu đồng thời | C01,C02 trong concurrency/starter. | Đọc ConcurrentIT của app; chạy PostgreSQL integration khi đủ môi trường. |
| S29 | Timeout và đọc lỗi | C03; đọc E01–E04 trong English error clinic. | Đọc E05–E08 và kiểm tra model thật theo RUNNING. |
| S30 | Bài DSA trộn A | M01–M04; đọc đề không mở lời giải; có thể chia hai buổi. | Đổi seed của test; tự tạo input phản ví dụ. |
| S31 | Bài DSA trộn B | M05–M08; giải thích vì sao bỏ một hướng khác. | Làm lại bài sai sau một ngày bằng dữ liệu khác. |
| S32 | Chứng minh dự án cuối | Chạy verify theo môi trường; làm checklist docs/PROJECT.md; viết mô tả đúng phạm vi đã chạy. | Tự chạy lại từ bản clone sạch; kiểm tra evidence không chứa secrets. |

## Ôn theo lỗi

```bash
python3 scripts/review.py tags
python3 scripts/review.py record P3.3 --result fail --tags overflow,off-by-one --hint 1 --evidence "offset âm với page lớn; chưa sửa"
python3 scripts/review.py due
python3 scripts/review.py recommend --limit 5
```

Bài fail trở lại sau 1 ngày và bắt đầu lại khoảng cách; partial hoặc pass có gợi ý cũng ôn sau 1 ngày, không tăng stage. Pass không gợi ý ở ngày mới tăng khoảng cách theo 1,3,7,14,30 ngày; lần ghi cùng ngày không tăng stage. Đây là quy tắc của công cụ, chưa phải mô hình ghi nhớ được hiệu chỉnh cho cá nhân.

Tag đang mắc được chấm ưu tiên: fail=3, partial/pass có hỗ trợ=1 mỗi bài; cộng theo tag liên quan để gợi ý bài khác. Cùng điểm thì ưu tiên bài chưa làm, sau đó ID. Điểm này chỉ xếp thứ tự bài, không phải xác suất quên. Pass không gợi ý xóa tag đang mắc của bài đó, lịch sử cũ vẫn giữ. Đọc yêu cầu trước khi chọn bài thuộc phase chưa học. Dữ liệu v2 dạng dictionary được giữ lại; công cụ không ghi gì cho đến lệnh record/done.