# Bản đồ 24 bài: tự làm ở đâu, kiểm tra bằng gì?

Các lệnh ở đây chạy từ gốc repo. Windows: `py` thay `python3`. Mã tham chiếu Spring ở `projects/knowledge-assistant/`; tạo bản tự làm để giữ riêng lời giải:

```bash
python3 scripts/new_spring_lab.py --phase 3 --destination work/spring-p3
mvn -f work/spring-p3/pom.xml test
```

Script từ chối thư mục đích đã tồn tại. P3 bắt đầu đỏ ở create, owned lookup, pagination và rollback. Sửa dần theo thứ tự. P4 dùng bản sao riêng:

```bash
python3 scripts/new_spring_lab.py --phase 4 --destination work/spring-p4
```

| ID | Vị trí tự làm | Kiểm tra / bằng chứng | Đối chiếu |
| --- | --- | --- | --- |
| P1.1 | `practice/starter/JavaCoreLab.java` normalizeTitle | `scripts/check.py --id P1.1` | `practice/solution/JavaCoreLab.java` |
| P1.2 | cùng file, Catalog | `--id P1.2`; giữ nguyên dữ liệu khi trùng ID | cùng file solution |
| P1.3 | cùng file, wordCounts | `--id P1.3`; cả input trắng | cùng file solution |
| P1.4 | cùng file, search | `--id P1.4`; thứ tự ID ổn định | cùng file solution |
| P2.1 | `practice/sql/API_CONTRACT.md` | bảng method/path/status và request/response; tự chấm rubric | `phases/02-http-sql/SOLUTIONS.md` |
| P2.2 | `practice/sql/starter.sql` counts | lệnh psql trong README sql | `practice/sql/solution.sql` |
| P2.3 | cùng file, next_page | psql: sau cursor 102 phải nhận 101 | cùng file solution |
| P2.4 | cùng file, rollback/commit | psql + ghi bằng chứng transaction | cùng file solution |
| P3.1 | bản copy P3, DocumentService + ApiTypes | `mvn test -Dtest=ApiTest#titleAndOwnerAreValidated+summaryAndQuestionUseOwnSources` | app tham chiếu |
| P3.2 | bản copy P3, requireOwned/repository | `mvn test -Dtest=ApiTest#ownerIsolationForReadWriteSummaryAndIndex` | app tham chiếu |
| P3.3 | bản copy P3, list; Java helper trong starter | `--id P3.3`; `ApiTest#paginationAndUpdateDelete` | BackendLab + app |
| P3.4 | bản copy P3, create transaction | `mvn test -Dtest=TransactionTest`; PostgreSQL: `mvn -Pintegration verify` | DocumentService, TransactionIT |
| P4.1 | BackendLab + copy P4 SecurityConfig | `--id P4.1`; ApiTest với Basic auth thật của filter | BackendLab + SecurityConfig |
| P4.2 | copy P4, OwnershipLearnerTest | tự viết test khác owner, thử bỏ điều kiện owner rồi phải đỏ | ApiTest; không để test chỉ kiểm tra fixture |
| P4.3 | copy P4, Dockerfile | build image, khởi động, gọi health; giữ dữ liệu khi restart DB | app Dockerfile/compose.yaml |
| P4.4 | copy P4, LEARNER_CI.yml | đặt workflow đúng thư mục, commit một lỗi có chủ ý vào branch học và quan sát CI thất bại | `.github/workflows/verify.yml` |
| P5.1 | AiLab.prompt | `--id P5.1`; xem dữ liệu được tách khỏi system | AiLab + OllamaModelGateway |
| P5.2 | AiLab.fits | `--id P5.2`; biên long | AiLab; model thật cần tokenizer/cấu hình tương ứng |
| P5.3 | AiLab.validate | `--id P5.3`; thêm output đúng schema nhưng sai nội dung để thảo luận | AiLab + KnowledgeService |
| P5.4 | AiLab retry | `--id P5.4`; các lỗi 400/429/503 | AiLab; app live mặc định một attempt |
| P6.1 | RagLab.chunks | `--id P6.1` | RagLab + TextRules |
| P6.2 | RagLab.cosine/retrieve | `--id P6.2`; fixture có tài liệu khác chủ | RagLab + PgvectorRetrieval |
| P6.3 | RagLab.validCitations | `--id P6.3`; KnowledgeServiceTest cho nguồn bịa | RagLab + KnowledgeService |
| P6.4 | RagLab.metrics | `--id P6.4`; tự đánh giá bộ câu hỏi của phase | RagLab + exams/P6.md |

`--id` là phần sau `python3 scripts/check.py`. Lệnh Maven chọn test của app phải chạy trong bản copy hoặc thêm `-f đường/dẫn/pom.xml`. P3.1–P3.4 có phụ thuộc: create phải hoạt động trước khi các test sau có dữ liệu để chạy.

Các bài triển khai và model thật cần môi trường riêng. Chỉ ghi “đã hoàn thành” sau khi tự chạy và lưu bằng chứng; xem `VALIDATION.md` cho phạm vi đã chạy khi soạn repo.

## Luồng bổ sung v1

| Nhóm | Tự làm | Kiểm tra |
| --- | --- | --- |
| C01–C03 | `concurrency/starter/ConcurrentLab.java` | `python3 scripts/check.py --track concurrency` |
| M01–M08 | `mixed/starter/MixedLab.java` | `python3 scripts/check.py --track mixed` và rubric viết tay |
| Lỗi tiếng Anh E01–E08 | Đọc output rồi tự giải thích | `python3 scripts/error_examples.py E01`; fixture cố ý trả exit khác0 |
| Buổi S01–S32 | Làm yêu cầu tại learning | `python3 scripts/learn.py next`; done yêu cầu evidence |

PUT của app v3 cần `expectedVersion` trong DTO. Các test và requests.http đã cập nhật. P3.2/P4.1 kiểm tra owner bằng payload hợp lệ để không nhầm lỗi validation400 với lỗi quyền404. C02 là lab trong RAM, chưa được nối vào POST của app.