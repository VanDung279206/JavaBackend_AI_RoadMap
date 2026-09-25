# Chạy mã lời giải Java

Các lớp ở `src/` là lời giải Java thuần cho Java Core, quy tắc backend, AI giả lập, phép tính RAG và 12 bài DSA. Không cần Maven, database, API key hoặc thư viện ngoài cho bộ này.

Yêu cầu JDK 17 trở lên; lộ trình chính đề xuất JDK 21. Chạy từ thư mục gốc repo:

```bash
python3 labs/run_checks.py
```

Trên Windows có Python Launcher:

```powershell
py labs/run_checks.py
```

Script biên dịch mã vào thư mục tạm, chạy `LabChecks` rồi xóa file build tạm. Kết quả thành công bắt đầu bằng `PASS:`. Nếu chỉ có Java runtime thiếu module compiler, cài JDK đầy đủ.

Nếu không dùng Python, có thể biên dịch thủ công. Bash:

```bash
mkdir -p labs/build
javac -encoding UTF-8 -d labs/build labs/src/*.java
java -cp labs/build LabChecks
```

PowerShell:

```powershell
New-Item -ItemType Directory -Force labs/build
$javaSources = (Get-ChildItem labs/src/*.java).FullName
javac -encoding UTF-8 -d labs/build $javaSources
java -cp labs/build LabChecks
```

## Mã nào tương ứng bài nào?

| File | Bài |
| --- | --- |
| `JavaCoreLab.java` | P1.1–P1.4 |
| `BackendLab.java` | Logic phân trang P3.3; quyền sở hữu P4.1 |
| `AiLab.java` | P5.1–P5.4, không gọi model thật |
| `RagLab.java` | P6.1–P6.4 với vector giả lập |
| `DsaSolutions.java` | D01–D12 |
| `LabChecks.java` | Ví dụ, biên, lỗi và so sánh với cách tính độc lập |

Đọc đề trước khi đọc các file lời giải. Với Spring, PostgreSQL, Docker và model thật, làm theo hướng dẫn tích hợp trong từng phase; chúng có yêu cầu môi trường riêng. Xem [phạm vi kiểm tra](../VALIDATION.md).

Bản cải tiến: tự làm bằng [practice/starter](../practice/README.md), đối chiếu [ứng dụng Spring](../projects/knowledge-assistant/README.md). `labs/src` được giữ để tương thích bộ bài cũ.