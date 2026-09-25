# Java Backend + AI Roadmap

Repo tự học theo dự án quản lý tài liệu: **Java → HTTP/SQL → Spring Boot → kiểm thử và phân quyền → AI → RAG**. Mỗi phần gắn với bài tự làm, bằng chứng chạy và câu hỏi giải thích.

## Bản cập nhật v1

| Phần cải tiến | Đã bổ sung |
| --- | --- |
| Kiểm chứng | [verify + báo cáo PASS/FAIL/BLOCKED](docs/RUNNING.md), HTTP/SQL/Docker và luồng live có fixture; [phạm vi thực chạy](VALIDATION.md) |
| Công cụ môi trường | doctor, launcher Maven Wrapper cố định phiên bản, lệnh cho Windows/Linux |
| Học từng buổi | [32 buổi với phần bắt buộc và mở rộng](learning/README.md), CLI chọn buổi tiếp theo |
| Gợi ý | 51 bộ ba cấp: câu hỏi → trace → giả mã; hiện riêng từng cấp |
| Ôn theo lỗi | 14 tag lỗi, giữ lịch sử, gợi ý bài liên quan, phân biệt dùng gợi ý và tự làm |
| DSA trộn | [8 đề không nêu pattern](mixed/EXERCISES.md), starter, oracle tests, rubric và lời giải |
| Backend đồng thời | [3 lab có test](concurrency/README.md); API PUT kiểm tra expectedVersion; PostgreSQL ConcurrentIT |
| Tiếng Anh | [8 lỗi được chạy tái hiện](english/ERROR_CLINIC.md), bản dịch, chẩn đoán, câu mẫu và bài giải thích |

```bash
python3 scripts/doctor.py
python3 scripts/learn.py next
python3 scripts/verify.py --suite offline
```

`verify` chạy bản tham chiếu. Để kiểm tra **bài tự làm**, dùng `check.py` không có `--mode solution`. Tiến độ ban đầu để trống; kết quả kiểm tra khi soạn repo không được ghi thành tiến độ của bạn.

## Bắt đầu trong repo

1. Chưa quen công cụ: mở [Phase 0](phases/00-setup/README.md).
2. Có JDK: đọc [practice](practice/README.md), sửa `practice/starter/JavaCoreLab.java` rồi chạy:

```bash
python3 scripts/check.py --id P1.1
```

Windows dùng `py`. Test đỏ với TODO trước khi làm là chủ ý. Lệnh mặc định kiểm tra **starter của bạn**; chỉ `--mode solution` mới kiểm tra lời giải tham chiếu.

3. Làm D01, viết 3 câu theo [bài tiếng Anh](english/CODING_TASKS.md), ghi [mức tự làm](progress/MASTERY.md).
4. Hết phase, làm [bài kiểm tra tổng hợp](exams/README.md) với dữ liệu mới.

## Nội dung

| Phần | Nội dung / liên kết |
| --- | --- |
| Phase 0 | Cài công cụ, Hello, breakpoint, đọc lỗi và commit |
| Sáu phase chính | [24 bài và lời giải](phases/README.md); [bản đồ file/test cho từng bài](docs/EXERCISE_MAP.md) |
| Tự làm Java | starter + tests + solution, chọn riêng từng ID; 41 nhóm gồm 14 bài quy tắc, 15 DSA và 12 biến thể |
| SQL | [Fixture, starter, solution và assertion PostgreSQL](practice/sql/README.md) |
| DSA | [12 bài gốc](dsa/EXERCISES.md), [3 bài linked list/tree/DFS và 12 biến thể](dsa/VARIANTS.md) |
| Sửa lỗi | [8 bài có mã cố ý sai](debug/README.md), test phát hiện lỗi và lời giải |
| Kiểm tra cuối phase | [6 đề tổng hợp, đáp án đối chiếu và rubric](exams/README.md) |
| Dự án xuyên suốt | [Catalog console](projects/catalog-cli/README.md) → [Spring CRUD/owner/summary/questions](projects/knowledge-assistant/README.md) |
| Tiếng Anh | [72 thuật ngữ cũ](english/GLOSSARY.md), [6 đoạn đọc](english/READING_PRACTICE.md), [viết commit và giải thích mã](english/CODING_TASKS.md) |
| Ghi nhớ | [36 flashcards](review/FLASHCARDS.md), [nhật ký lỗi](review/ERROR_LOG.md), [lịch ôn cục bộ](progress/MASTERY.md) |

## Các chặng

| Phase | Đầu ra phải tự chứng minh |
| --- | --- |
| 0 | Chạy, debug và commit chương trình đầu tiên |
| 1 | Catalog console có validation, duplicate handling và test |
| 2 | Schema, JOIN, cursor pagination, transaction và API contract |
| 3 | CRUD Spring có DTO, service, repository và migration |
| 4 | Owner authorization, rollback test, PostgreSQL integration, Docker/CI |
| 5 | Summary gateway, prompt/input/output checks, retry policy; xác minh model thật khi tích hợp |
| 6 | Retrieval đúng quyền, nguồn hợp lệ, invalidation và evaluation |

Checklist chi tiết: [ROADMAP.md](ROADMAP.md). Cách chọn điểm bắt đầu: [GETTING_STARTED.md](docs/GETTING_STARTED.md).

## Công nghệ và chế độ chạy

Java target 17, đề xuất JDK 21; Maven; app tham chiếu pin Spring Boot 3.5.16. Spring AI 1.1.8/Ollama là Maven profile tùy chọn, phù hợp nhánh Boot 3.5.x theo [Spring AI](https://github.com/spring-projects/spring-ai). Thay đổi phiên bản phải đối chiếu [nguồn chính thức](docs/RESOURCES.md), không trộn hướng dẫn của các nhánh.

Java practice chạy không cần dependency ngoài. App có demo H2+trích đoạn/tìm theo từ, PostgreSQL lưu bền và adapter Ollama+pgvector tùy chọn. Demo không gọi LLM. Chi tiết và những phần chưa chạy xác minh nằm trong [VALIDATION.md](VALIDATION.md).

## Tự làm Spring

```bash
python3 scripts/new_spring_lab.py --phase 3 --destination work/spring-p3
./mvnw -f work/spring-p3/pom.xml test
```

Bản copy chứa TODO; test bắt đầu đỏ. Script từ chối ghi đè thư mục cũ. Mã hoàn chỉnh để đối chiếu vẫn ở `projects/knowledge-assistant/`.

## Tiêu chí hoàn thành một bài

- [ ] Tự viết được mã hoặc truy vấn theo hợp đồng.
- [ ] Test đúng mã của mình; thêm ít nhất một input biên.
- [ ] Giải thích nguyên nhân một lỗi và invariant của lời giải.
- [ ] Viết 3–5 câu tiếng Anh đúng với điều đã làm.
- [ ] Làm lại hoặc giải biến thể ở buổi khác, ghi bằng chứng.

CI hiện kiểm tra **bản tham chiếu**, không tự chứng nhận bạn đã hoàn thành starter. Xem [CHANGELOG.md](CHANGELOG.md) và [VALIDATION.md](VALIDATION.md).