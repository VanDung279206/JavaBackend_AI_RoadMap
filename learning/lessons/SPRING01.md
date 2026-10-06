# SPRING01 — Request qua các lớp và dependency injection

## Mục tiêu và kiến thức trước

Trace Controller → Service → Repository; dùng constructor để cung cấp dependency và fake khi test.

**Cần biết trước:** HTTP01; interface và constructor.

## Tình huống

Controller nhận request, service giữ nghiệp vụ, repository lưu dữ liệu. Service không tự tạo repository nên dễ thay fake.

## Ví dụ chạy được

Lệnh từ gốc repository: `java learning/examples/SPRING01.java`. Java cần JDK 17+; ví dụ Python dùng thư viện chuẩn.

```java
import java.util.*;
import java.nio.file.*;
import java.util.concurrent.*;

public class SPRING01 {
    interface Repository { void save(String title); }
    static final class Service {
        private final Repository repository;
        Service(Repository repository) { this.repository=repository; }
        void create(String title) { if(title.isBlank()) throw new IllegalArgumentException(); repository.save(title.strip()); }
    }
    public static void main(String[] args) {
        Repository fake=title->System.out.println("Repository: "+title);
        Service service=new Service(fake);
        System.out.println("Controller"); service.create(" Java ");
    }
}
```

**Diễn giải từng bước:**

1. main đóng vai controller và composition root, cung cấp fake repository vào constructor.
2. Service validate rồi gọi dependency; không phụ thuộc cách lưu.
3. Trong Spring dùng @RestController/@Service/@Repository và constructor injection; container tạo bean và nối dependency. Ví dụ này Java thuần để nhìn rõ DI; P3.1 chạy ứng dụng Spring thật.

**Kết quả:**

```text
Controller
Repository: Java
```

## Lỗi thường gặp

**Nhận biết:** Service tự new repository hoặc controller chứa mọi nghiệp vụ nên khó test riêng.

**Cách sửa:** Đưa dependency qua constructor; service giữ luật, controller chuyển HTTP/DTO, repository giữ persistence.

## Kiểm tra hiểu bài

Muốn kiểm service gọi save mấy lần khi title blank thì thay dependency thế nào?

Viết dự đoán và lý do trước khi mở đáp án. Thay một đầu vào trong ví dụ, dự đoán lại rồi chạy.

## Thực hành liên quan

P3.1. Mở đề, kiểm tiên quyết, dùng gợi ý từng mức nếu cần; lưu expected/actual và output của lệnh kiểm tra. Không dùng kết quả của ví dụ hoặc solution để thay bằng chứng trên bài tự làm.
