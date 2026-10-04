# Lời giải Phase 4

## P4.1 — Kiểm tra quyền

Mã ở [BackendLab.java](../../labs/src/BackendLab.java). Tra cứu theo ID; nếu null hoặc owner khác principal thì ném `NotFound`; chỉ sau đó mới trả nội dung. Lời giải HTTP có thể dùng truy vấn `findByIdAndOwnerId` của phase 3 để giới hạn ngay tại database.

`principalUserId` không được lấy từ tham số do client tự khai. Trong ứng dụng thật, kiểm tra danh tính từ session/token đã xác minh và ánh xạ sang user ID nội bộ.

## P4.2 — Các kiểm tra có ý nghĩa

| Ca kiểm tra | Mong đợi | Lỗi có thể phát hiện |
| --- | --- | --- |
| User 1 đọc doc 101 của mình | Trả doc 101 | Chặn nhầm chủ sở hữu |
| User 2 đọc doc 101 | NotFound | Thiếu kiểm tra owner |
| User 1 đọc doc 999 | NotFound | Trả null hoặc xử lý sai dữ liệu thiếu |
| Thêm lại ID đã có | Exception; bản gốc còn nguyên | Ghi đè trước khi báo lỗi |
| Page rất lớn | Danh sách rỗng | Tràn số khi tính offset |

Các ca Java thuần được thực thi bởi [LabChecks.java](../../labs/src/LabChecks.java). Nếu bỏ kiểm tra owner, ca user 2 sẽ thất bại. Kiểm tra này xác minh quy tắc trong hàm; để xác minh cả HTTP/security filter/database, cần bài kiểm thử tích hợp ứng dụng Spring.

## P4.3 — Dockerfile mẫu

Ví dụ dưới đây giả định bạn đã tạo `app.jar` là executable JAR của dự án và có image JRE 21 đã chọn. Đặt image cụ thể vào build argument để ghi nhận đúng phiên bản/image digest khi áp dụng.

```dockerfile
ARG JAVA_RUNTIME_IMAGE
FROM ${JAVA_RUNTIME_IMAGE}
WORKDIR /app
COPY app.jar /app/app.jar
USER 10001
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
```

`JAVA_RUNTIME_IMAGE` là placeholder cần cung cấp; image được chọn phải cho user 10001 đọc/chạy Java và ứng dụng. Cấu hình môi trường Spring dùng `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD`; tên biến khóa AI phụ thuộc provider/config của dự án.

Lệnh Bash mẫu, sau khi đã gán biến và tạo network cùng database:

```bash
docker build --build-arg JAVA_RUNTIME_IMAGE="$JAVA_RUNTIME_IMAGE" -t knowledge-assistant:local .
docker run --rm --network knowledge-net -p 8080:8080 \
  -e SPRING_DATASOURCE_URL -e SPRING_DATASOURCE_USERNAME \
  -e SPRING_DATASOURCE_PASSWORD knowledge-assistant:local
```

Database URL phải trỏ tới hostname truy cập được từ network container. `localhost` là chính container ứng dụng. Kiểm tra một endpoint đã có, rồi khởi động lại ứng dụng và đọc lại dữ liệu. `EXPOSE` là metadata; `-p` mới thiết lập ánh xạ cổng trong lệnh trên.

## P4.4 — CI và log

Trong repo này, bước kiểm tra Java thuần là `python3 labs/run_checks.py`. Với ứng dụng Maven đã có wrapper, bước ứng dụng có thể là `./mvnw verify`; muốn các integration test chạy trong `verify`, phải cấu hình lifecycle/plugin tương ứng và cung cấp database cần thiết.

Pipeline dừng khi lệnh trả exit code khác 0. Chỉ đóng gói sau kiểm tra thành công. Log nên có request ID, endpoint, status, thời gian và loại lỗi. Không ghi mật khẩu/API key; hạn chế ghi nguyên văn tài liệu riêng tư. Có thể đối chiếu request ID để tìm luồng lỗi.

Nguồn: [Spring Security](https://docs.spring.io/spring-security/reference/index.html), [Dockerfile reference](https://docs.docker.com/reference/dockerfile/).