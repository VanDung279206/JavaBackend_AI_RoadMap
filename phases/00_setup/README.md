# Phase 0 — Chuẩn bị để tự viết, chạy và sửa Java

Đầu ra: chạy được chương trình từ terminal và IDE, dừng ở breakpoint, đọc được vị trí lỗi, tạo commit. Có thể bỏ qua nếu tự chứng minh được cả bốn đầu ra.

## P0.1 — Kiểm tra công cụ

Cài **JDK 21 đầy đủ**, một IDE Java, Git và Maven. Python 3 chỉ cần cho các runner tiện dụng. Docker/PostgreSQL có thể để đến phase 2–4. Mã Java thuần của repo dùng cú pháp Java 17 để có thể chạy trên JDK 17 hoặc 21.

Nguồn cài đặt và hướng dẫn: [Java setup](https://dev.java/learn/getting-started/), [Maven installation](https://maven.apache.org/install.html), [Git setup](https://git-scm.com/book/en/v2/Getting-Started-First-Time-Git-Setup). Không dùng số phiên bản của ảnh hướng dẫn cũ làm tiêu chí.

```text
java -version
javac -version
git --version
mvn -version
```

Ghi kết quả thực tế vào nhật ký. `mvn -version` phải cho thấy JDK bạn đã chọn. Trên Windows kiểm tra đường dẫn bằng `where.exe java` và `where.exe javac`; trên macOS/Linux dùng `command -v java` và `command -v javac`. Nếu chỉ có `java` nhưng không có compiler, kiểm tra lại JDK và PATH.

## P0.2 — Chạy chương trình đầu tiên

Mở terminal ở **gốc repo**:

```bash
java phases/00-setup/HelloRoadmap.java
```

Kết quả: `Hello Java Backend + AI`. Sau đó tự đổi thông điệp, chạy lại và giải thích `class`, `main`, `String[] args`, `println`. Tên public class phải khớp tên file khi dùng cách biên dịch thông thường.

Bài nhỏ để tự viết: đọc hai số từ `args` và in tổng. Ví dụ `java YourSum.java 4 7` → `11`. Trường hợp thiếu tham số phải in hướng dẫn, không ném stack trace khó hiểu cho người dùng.

## P0.3 — Debug và đọc lỗi

Chạy `java phases/00-setup/DebugDemo.java`. Mã cố ý sai với `[2,4,6]`.

1. Trước khi chạy, dự đoán kết quả đúng là 12.
2. Đặt breakpoint tại dòng `total += values[i]` trong IDE.
3. Chạy Debug; theo dõi `i`, `values.length`, `total`; dùng Step Over.
4. Khi lỗi xuất hiện, ghi exception type, thông báo, file và dòng đầu tiên thuộc mã của bạn.
5. Sửa một ký tự trong điều kiện vòng lặp. Thử thêm mảng rỗng và `[5]`.

Lời giải: `i < values.length`; chỉ số hợp lệ là 0 đến length−1. Mảng rỗng có tổng 0. Stack trace cho biết nơi lỗi biểu hiện; nguyên nhân có thể ở dữ liệu hoặc lời gọi trước đó.

## P0.4 — Commit đầu tiên

Nếu thư mục này chưa là repo Git:

```bash
git init -b main
git status
git add README.md phases/00-setup
git diff --cached
git commit -m "docs: record phase 0 setup"
```

Nếu Git yêu cầu tên/email, dùng danh tính bạn muốn gắn với commit. Không điền danh tính mẫu của người khác. Xem diff trước commit; không commit `.env`, mật khẩu hoặc thư mục build.

## Cửa kiểm tra Phase 0

- [ ] Tự chạy chương trình từ terminal.
- [ ] Giải thích lỗi ở DebugDemo và tự sửa được.
- [ ] Chỉ ra JDK mà Maven đang dùng.
- [ ] Có một commit chỉ chứa thay đổi dự định lưu.
- [ ] Viết tiếng Anh: “I compiled the program and fixed an array index error.”

Tiếp theo: [practice/README.md](../../practice/README.md) → P1.1. Trên Windows, thay `python3` trong hướng dẫn bằng `py` nếu dùng Python Launcher.