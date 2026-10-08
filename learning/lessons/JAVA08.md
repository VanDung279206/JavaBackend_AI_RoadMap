# JAVA08 — Exception và file UTF-8

## Mục tiêu và kiến thức trước

Phân biệt vắng dữ liệu với lỗi đọc; đóng tài nguyên và giữ bằng chứng.

**Cần biết trước:** JAVA03, JAVA04 và biết try/catch.

## Tình huống

Bạn tải danh mục từ file. File trống là kết quả hợp lệ, file không tồn tại phải báo lỗi.

## Ví dụ chạy được

Lệnh từ gốc repository: `java learning/examples/JAVA08.java`. Java cần JDK 17+; ví dụ Python dùng thư viện chuẩn.

```java
import java.util.*;
import java.nio.file.*;
import java.util.concurrent.*;

public class JAVA08 {
    public static void main(String[] args) throws Exception {
        Path file=Files.createTempFile("lesson-",".txt");
        try {
            Files.writeString(file," Tiếng Việt \n\nJava\n");
            try(var lines=Files.lines(file)) { System.out.println(lines.map(String::strip).filter(s->!s.isEmpty()).toList()); }
        } finally { Files.delete(file); }
        try { Files.readString(file); } catch(java.io.IOException e) { System.out.println("missing file"); }
    }
}
```

**Diễn giải từng bước:**

1. Tạo file tạm giúp chạy lại không phụ thuộc đường dẫn máy.
2. Ghi/đọc UTF-8; strip rồi lọc dòng trắng; try-with-resources đóng stream.
3. finally xóa file; lần đọc tiếp theo bắt IOException và báo missing.

**Kết quả:**

```text
[Tiếng Việt, Java]
missing file
```

## Lỗi thường gặp

**Nhận biết:** Catch IOException rồi trả [] khiến ứng dụng coi mất file là danh mục rỗng.

**Cách sửa:** Truyền lỗi cho caller hoặc báo rõ lỗi; dùng try-with-resources, không giữ stream sau khối try.

## Kiểm tra hiểu bài

File trống và file thiếu nên có cùng kết quả không?

Viết dự đoán và lý do trước khi mở đáp án. Thay một đầu vào trong ví dụ, dự đoán lại rồi chạy.

## Thực hành liên quan

JP11, JP12, JP14, JP15, J03. Mở đề, kiểm tiên quyết, dùng gợi ý từng mức nếu cần; lưu expected/actual và output của lệnh kiểm tra. Không dùng kết quả của ví dụ hoặc solution để thay bằng chứng trên bài tự làm.
