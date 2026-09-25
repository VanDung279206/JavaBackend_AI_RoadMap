# Bắt đầu đúng một việc

| Bạn tự làm được gì? | Điểm bắt đầu |
| --- | --- |
| Chưa chạy/debug/commit Java được | [Phase 0](../phases/00-setup/README.md) |
| Có công cụ, còn yếu Java | [Practice](../practice/README.md), P1.1 |
| Java cơ bản đã chắc | [Kiểm tra P1](../exams/P1.md), rồi SQL |
| Đã xây CRUD và PostgreSQL | [Kiểm tra P3](../exams/P3.md), rồi quyền/test/AI |

Buổi đầu: chạy Hello → mở `practice/starter/JavaCoreLab.java` → làm normalizeTitle → `python3 scripts/check.py --id P1.1` → giải thích 3 câu tiếng Anh → commit → ghi ngày ôn. Windows dùng `py` thay `python3`.

Vòng học mỗi bài: **đề → tự viết → test → debug → giải thích → biến thể → ôn lại**. Chỉ xem solution sau lần tự thử; nếu cần gợi ý hãy ghi rõ vào nhật ký.

[Bản đồ 24 bài](EXERCISE_MAP.md) chỉ đúng file và cách chấm; không cần tự tìm giữa nhiều thư mục. Khi đến Spring, [ứng dụng tham chiếu](../projects/knowledge-assistant/README.md) đã có project. Tạo bản tự làm:

```bash
python3 scripts/new_spring_lab.py --phase 3 --destination work/spring-p3
```

Script không ghi đè một lần làm trước. Chạy Maven trong bản copy đó; đọc file `LEARNER.md`.

## Git

Giải nén ZIP, mở gốc repo, kiểm tra `git status`. Nếu chưa có Git repo, chạy `git init -b main`. Sau mỗi bài dùng `git diff`, `git add` đúng file và `git commit` với thông điệp nêu hành vi thay đổi. Khi đưa lên GitHub, tự tạo remote theo tài khoản và URL thực của bạn; gói này chưa được đẩy lên GitHub.

## Khi gặp lỗi môi trường

| Thông báo/tình huống | Kiểm tra đầu tiên |
| --- | --- |
| java/javac not found | JDK đầy đủ và PATH |
| Maven dùng nhầm Java | `mvn -version`, JAVA_HOME |
| dependency download lỗi | Kết nối tới repository và cấu hình proxy Maven |
| Port 8080/5432 đang dùng | Dừng app cũ hoặc đặt port tương ứng |
| Docker not found/daemon unavailable | Cài Docker, khởi động daemon; chỉ cần cho DB/integration |
| Tests đỏ với TODO | Đây là bài chưa làm, mở starter theo ID |
| Unknown exercise ID | Dùng ID trong bảng; không tự đánh dấu pass |
| Ollama trả lỗi dimension | Kiểm tra model/tag, output dimension thực tế và reindex |

Xem `VALIDATION.md` để phân biệt những gì đã chạy và những phần bạn cần xác nhận trên môi trường của mình.

## Làm theo từng buổi trong bản v3

Mở [learning/README.md](../learning/README.md) hoặc chạy `python3 scripts/learn.py next`. Mỗi buổi có yêu cầu tối thiểu, bằng chứng và phần mở rộng. Dùng [doctor và verify](RUNNING.md) để biết phần nào sẵn sàng, phần nào cần cấu hình thêm. Bắt đầu bằng S01 nếu chưa quen công cụ; nếu đã có bằng chứng tương ứng thì tự ghi nhận buổi đã hoàn thành.