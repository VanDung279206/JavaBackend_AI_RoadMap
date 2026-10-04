# Knowledge Assistant — ứng dụng tham chiếu theo mốc học

Có mã CRUD, owner authorization, audit transaction, summary, câu hỏi có nguồn và cấu hình chạy. **Xem [VALIDATION.md](../../VALIDATION.md) trước khi dùng kết quả kiểm tra làm bằng chứng:** ở phiên soạn này, chỉ Java thuần đã được chạy; chưa build hoặc chạy Spring/Maven/Docker/model thật.

| Chế độ | Database | Summary / hỏi đáp | Cần thêm |
| --- | --- | --- | --- |
| `demo` (mặc định) | H2 trong bộ nhớ | Trích nguyên đoạn + tìm theo từ; mode ghi rõ demo | JDK, Maven, tải dependency lần đầu |
| `postgres` | PostgreSQL lưu bền | Như demo | PostgreSQL, cấu hình tài khoản |
| `postgres,real-ai` | PostgreSQL + pgvector | Spring AI ChatClient + Ollama, embedding thật, vector retrieval | Maven profile `real-ai`, Ollama có model, đúng dimensions |

App pin Spring Boot **3.5.16**, Spring AI **1.1.8** ở profile tùy chọn; Java target 17, đề xuất chạy JDK 21. Đây là cấu hình cụ thể của bản học, không tuyên bố là phiên bản mới nhất. Không ghép dependency Spring AI 2.x vào project này. [Spring AI README](https://github.com/spring-projects/spring-ai) ghi nhánh 1.1.x tương thích Boot 3.5.x; [release 1.1.8](https://spring.io/blog/2026/06/12/spring-ai-1-1-8-1-0-9-avaialble-now/) và [Boot dependencies](https://docs.spring.io/spring-boot/3.5/appendix/dependency-versions/coordinates.html) là nguồn đối chiếu.

## 1. Chạy demo đầu tiên

Từ gốc repo:

```bash
mvn -f projects/knowledge-assistant/pom.xml clean test
mvn -f projects/knowledge-assistant/pom.xml spring-boot:run
```

API ở `http://localhost:8080`, bind mặc định 127.0.0.1. Dữ liệu demo mất khi app dừng. Tài khoản demo: `an / an-demo-only`, `binh / binh-demo-only`. Đây là credential mẫu công khai cho học cục bộ.

Dùng [requests.http](requests.http) hoặc Bash:

```bash
curl -u an:an-demo-only -H 'Content-Type: application/json' -d '{"title":"Java Notes","content":"Java uses classes. PostgreSQL stores documents."}' http://localhost:8080/documents
curl -u an:an-demo-only http://localhost:8080/documents
curl -u an:an-demo-only -H 'Content-Type: application/json' -d '{"question":"Java","k":2}' http://localhost:8080/questions
```

Trên Windows PowerShell, dùng `Invoke-RestMethod` hoặc HTTP client đọc file `.http`; dấu nháy JSON của Bash không dùng nguyên xi cho mọi bản PowerShell.

```powershell
$token = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes('an:an-demo-only'))
$headers = @{ Authorization = "Basic $token" }
$body = @{ title = 'Java Notes'; content = 'Java uses classes.' } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri 'http://localhost:8080/documents' -Headers $headers -ContentType 'application/json' -Body $body
```

## 2. Chạy PostgreSQL

Trong thư mục app, copy `.env.example` thành `.env`, điền ba password cục bộ rồi:

```bash
docker compose --profile app up --build
```

App và database đều bind port host ở loopback. PostgreSQL dùng volume `knowledge-data`; dừng bằng `docker compose down` giữ volume. Không thêm `-v` nếu muốn giữ dữ liệu. API credential dùng giá trị `.env` bạn đã đặt.

Muốn app chạy bằng Maven trên host: `docker compose up -d db`, rồi export `DB_PASSWORD`, `APP_AN_PASSWORD`, `APP_BINH_PASSWORD` vào terminal và:

```bash
mvn spring-boot:run -Dspring-boot.run.profiles=postgres
```

Compose tự đọc `.env` của Compose; Maven trên host **không** tự đọc file đó. Bash dùng `export TÊN_BIẾN='giá-trị'`; PowerShell dùng `$env:TÊN_BIẾN='giá-trị'`. Database URL mặc định localhost:5432/knowledge; username knowledge. Container app dùng hostname `db`, không dùng localhost.

## 3. Chạy Ollama + pgvector khi đến phase 5–6

1. Dùng database Compose có extension pgvector. Dừng container app nếu chạy Maven host trên cùng port.
2. Chạy Ollama trên máy của bạn và tải một chat model, một embedding model phù hợp. Repo không tự tải model và không giả định RAM/phần cứng của bạn.
3. Khai báo các biến bên dưới bằng tên/tag model thực tế đã có. `EMBEDDING_DIMENSIONS` phải khớp output embedding thật; không đoán từ tên model.
4. Build và chạy với **cả** Maven profile và runtime profile:

```bash
mvn -Preal-ai clean package
mvn -Preal-ai spring-boot:run -Dspring-boot.run.profiles=postgres,real-ai
```

| Biến | Giá trị phải cung cấp |
| --- | --- |
| `DB_PASSWORD`, `APP_AN_PASSWORD`, `APP_BINH_PASSWORD` | Credential cục bộ đã đặt |
| `OLLAMA_BASE_URL` | Mặc định http://localhost:11434 |
| `OLLAMA_CHAT_MODEL` | Tên/tag chat model đã tải |
| `OLLAMA_EMBED_MODEL` | Tên/tag embedding model đã tải |
| `EMBEDDING_DIMENSIONS` | Số chiều xác nhận từ model thực tế |
| `MIN_SIMILARITY` | Mặc định 0.2, chỉ là điểm bắt đầu để tự đánh giá |

Sau khi tạo doc, gọi `POST /documents/{id}/index`, rồi `POST /questions`. Sau khi sửa doc phải index lại. Lỗi embedding làm transaction index rollback; chunk cũ không được dùng nếu revision không còn khớp. Cùng số chiều chưa đủ để trộn model; đổi model/tag revision cần reindex.

Profile `real-ai` thêm migration V2 và source ở `src/real-ai/java`. Database đã áp dụng V2 nên tiếp tục chạy với profile đó; nếu quay về cấu hình không có V2, Flyway validation có thể báo thiếu migration. Dùng database học riêng cho mỗi cấu hình nếu cần thử qua lại.

Pgvector dùng exact search và owner/model/dimension/version filter trước top-k qua CTE MATERIALIZED. Chưa tạo ANN index. Embedding vector được kiểm tra hữu hạn, đúng chiều và khác zero trước ghi database.

## 4. Hợp đồng API

| Method/path | Thành công | Lỗi cần tự kiểm tra |
| --- | --- | --- |
| GET /health | 200, không cần auth | health này chỉ xác nhận web handler, chưa kiểm tra DB/model |
| POST /documents | 201 + Location | 400 title/content/body field sai; 401 |
| GET /documents?page=0&size=20 | 200, items+page+size+total | 400 page<0/size ngoài1..100 |
| GET /documents/{id} | 200 | 404 thiếu hoặc khác owner |
| PUT /documents/{id} | 200, cập nhật và invalidation | 400/404 |
| DELETE /documents/{id} | 204 | 404 |
| POST /documents/{id}/summary | 200, mode+summary | 400 nội dung trắng;404;502 output/model lỗi |
| POST /documents/{id}/index | 200, số chunk+mode | 404;502 embedding lỗi |
| POST /questions | 200, ANSWERED hoặc INSUFFICIENT_CONTEXT | 400 question/k sai;502 citation/model lỗi |

Mọi endpoint ngoài health yêu cầu Basic auth. Owner lấy từ principal; body có ownerId bị từ chối vì không phải trường DTO. Demo limit 200 documents/user khi hỏi; đây là giới hạn minh họa, không có tuyên bố chịu tải sản xuất.

## 5. Kiểm thử

```bash
# H2 + HTTP filter + owner + transaction + mocked model contract
mvn clean test
# PostgreSQL thật qua Testcontainers, cần Docker daemon
mvn -Pintegration clean verify
# Kiểm tra biên dịch cả adapter tùy chọn; không gọi model thật trong tests
mvn -Preal-ai clean verify
```

`ApiTest`: auth, CRUD, input, owner, summary/question. `TransactionTest`: rollback H2. `KnowledgeServiceTest`: không gọi generation khi thiếu context và chặn citation bịa. `PostgresIT`/`TransactionIT`: database thật; Maven Failsafe chỉ chạy khi có profile integration. Thiếu Docker phải làm job lỗi, không báo integration đã pass.

Test model giả lập không đánh giá nội dung model thật. Chạy fixture trong `phases/06-rag/EVALUATION_SET.md` rồi ghi config, model, câu hỏi, source và đánh giá thủ công khi tích hợp live.

## 6. Các giới hạn học tập cần hiểu

- Basic auth, user trong bộ nhớ và CSRF tắt dùng cho API cục bộ qua CLI. Khi xây client trình duyệt/triển khai cần thiết kế lại auth/CSRF, TLS và quản lý user phù hợp.
- Demo summary chỉ trích đoạn; demo retrieval khớp từ. Chúng minh họa luồng backend, không thể hiện năng lực LLM hay embedding.
- App live có connect/read timeout 5/30 giây trên RestClient, giới hạn output512 và một attempt. Đây là cấu hình đề xuất, chưa được chạy kiểm chứng với provider trong phiên tạo repo. Token budget chính xác chưa được tích hợp vì cần tokenizer và context model được chọn; bài P5.2 luyện quy tắc riêng.
- Index gọi embedding khi đang giữ row lock để minh họa tính nguyên tử. Với workload lớn, tách job và kiểm tra revision trước publish; không giữ transaction mạng dài như mô hình học này.
- Citation ID hợp lệ không bảo đảm nội dung có căn cứ. Không có kiểm thử nào ở đây chứng minh miễn nhiễm prompt injection.

Làm theo [MILESTONES.md](MILESTONES.md); để tự làm bắt đầu từ `scripts/new_spring_lab.py`, không sửa bản tham chiếu để giả lập tiến độ.

## Chống ghi đè phiên bản cũ

POST vẫn nhận title/content. GET và POST trả `version`. PUT từ bản v3 bắt buộc gửi `expectedVersion` cùng title/content:

```json
{"title":"Updated","content":"New content","expectedVersion":0}
```

Dùng version thực sự vừa đọc, không luôn ghi 0. Service lọc owner và khóa dòng, so version client với bản hiện tại rồi mới thay đổi dữ liệu, invalidation và audit cùng transaction. Một thay đổi đã lưu làm version tăng; dữ liệu không thay đổi có thể không làm Hibernate tăng version. Client cũ không gửi version nhận400; version đã cũ nhận409 và cần tải lại/giải quyết xung đột, không tự gửi lại với version mới để ghi đè. Owner khác nhận404 với request hợp lệ.

`ApiTest#staleWriteIsRejectedAndVersionIsRequired` kiểm tra HTTP; `ConcurrentIT` dùng hai thread và PostgreSQL thật qua Testcontainers. Hai yêu cầu cùng sửa một phiên bản theo nội dung khác nhau phải có đúng một thành công và một Stale, chỉ một audit UPDATED. Test được đưa vào `-Pintegration verify`; trạng thái thực chạy xem VALIDATION ở gốc repo. POST chưa hỗ trợ idempotency key; bài riêng ở concurrency/C02 minh họa quy tắc trong một JVM.
