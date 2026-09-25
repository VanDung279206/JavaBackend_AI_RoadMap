# Kiểm tra môi trường và chạy kiểm chứng

Từ gốc repo. Windows dùng `py` thay `python3`.

```bash
python3 scripts/doctor.py
python3 scripts/doctor.py --profile integration --network
python3 scripts/doctor.py --profile live
```

PASS = điều kiểm tra đạt; BLOCKED = thiếu điều kiện bắt buộc; INFO = thông tin cần đối chiếu. Không in giá trị password hoặc token. Port đang có dịch vụ không tự động là lỗi: đó có thể là app bạn đang chạy.

## Maven Wrapper

Repo có `mvnw`, `mvnw.cmd`, cấu hình Maven 3.9.11 và Apache Maven Wrapper 3.3.4. Hai launcher do repo viết, gọi JAR chính thức qua Python 3; chúng không phải bản sao nguyên văn script của Apache. Lần đầu cần mạng để tải wrapper JAR, Maven distribution và dependency. JDK vẫn phải được cài. Không có khẳng định wrapper đã bootstrap thành công trong môi trường tạo repo.

```bash
./mvnw -version
./mvnw -f practice/pom.xml clean test -Dcode.mode=solution
./mvnw -f projects/knowledge-assistant/pom.xml clean test
```

PowerShell: `./mvnw.cmd` thay `./mvnw`. Nếu quyền executable không được giữ khi giải nén trên Linux/macOS, dùng `sh mvnw ...` hoặc `python3 scripts/maven.py ...`. Launcher nhận `JAVA_HOME` và `MAVEN_OPTS`; không hỗ trợ mọi biến mở rộng riêng của các script Maven khác.

Nguồn: [Apache Maven Wrapper](https://maven.apache.org/tools/wrapper/), [release 3.3.4](https://github.com/apache/maven-wrapper/releases/tag/maven-wrapper-3.3.4). JAR được tải từ URL Maven Central cố định theo phiên bản; kiểm tra cấu trúc JAR không tương đương pin checksum. Chỉ dùng kết nối HTTPS và repository được cấu hình đúng.

## Một lệnh kiểm chứng

```bash
python3 scripts/verify.py --suite offline
python3 scripts/verify.py --suite integration
python3 scripts/verify.py --suite live
python3 scripts/verify.py --suite all
```

`offline`: các chương trình Java, công cụ học và hợp đồng không cần dependency mạng. `integration`: Maven/JUnit, PostgreSQL Testcontainers, SQL labs trong container, Docker build và luồng HTTP. `live`: dùng app Ollama/pgvector đang chạy và biến môi trường đầy đủ. `all`: yêu cầu cả ba; phần bị chặn làm kết quả tổng thể không đạt. Report được ghi vào thư mục có thời điểm riêng dưới `checks/runs/`; không sửa kết quả cũ thành pass.

Integration runner tạo và dọn đúng container do chính nó tạo. Không xóa volume hoặc database bên ngoài. Chạy live chỉ dùng tài liệu fixture do script tạo và xóa đúng ID đó trong finally.

Live evaluation kiểm tra HTTP, cấu trúc, quyền, index và ID nguồn. Việc câu trả lời có đúng nghĩa vẫn cần đọc thủ công; report ghi `semantic_review: REQUIRED`, không tự cho điểm chất lượng model.

## Phạm vi và điều kiện của runner

- Exit0: mọi gate tự động đã yêu cầu đều PASS; exit1: có FAIL; exit2: chưa có FAIL nhưng có BLOCKED. Nếu vừa fail vừa blocked, exit1 và report vẫn giữ đủ từng dòng.
- `--output thư_mục_mới` chọn nơi ghi; từ chối thư mục đã tồn tại để giữ báo cáo cũ. Không chạy Python với `-O` hoặc PYTHONOPTIMIZE vì HTTP checks cần assertions.
- Integration cần Docker daemon có thể tạo container, kéo image, Maven Central hoặc cache đầy đủ. Runner tạo network/DB/app riêng, kiểm tra dữ liệu sau restart app và dọn tài nguyên của lượt chạy đó. Log build/test nằm trong report directory.
- Live gọi app **đang chạy**; không cần Docker CLI nếu app/DB được chạy theo cách khác. Cần Ollama và model đã tải, biến môi trường trong profile live. App phải dùng `postgres,real-ai` và cả hai tài khoản học chưa có tài liệu. Runner từ chối app có tài liệu sẵn để tránh trộn dữ liệu đánh giá.
- `python3 scripts/verify.py --suite live --base-url http://127.0.0.1:8080` tạo fixture, gọi summary/index/questions, kiểm tra owner, stale write, invalidation và reindex. Nội dung model trả về được lưu trong live-ai.json kể cả khi một assertion sau đó lỗi. Script không tự tải model.
- Với live, gate `live-semantic-review` luôn yêu cầu chấm tay, nên tổng thể vẫn BLOCKED sau khi HTTP đạt. Ghi đánh giá vào [mẫu chấm](../projects/knowledge-assistant/eval/LIVE_REVIEW.md) kèm đường dẫn/hash của live-ai.json; không sửa report gốc thành pass. Chỉ mô tả chất lượng đã chấm trên các ca đã có bằng chứng.