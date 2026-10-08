# JAVA07 — Bảo vệ dữ liệu bên trong

## Mục tiêu và kiến thức trước

Phân biệt live view, bản sao và snapshot bất biến.

**Cần biết trước:** JAVA02 và JAVA04.

## Tình huống

Caller được xem danh mục, nhưng không được xóa dữ liệu nội bộ bằng list trả về.

## Ví dụ chạy được

Lệnh từ gốc repository: `java learning/examples/JAVA07.java`. Java cần JDK 17+; ví dụ Python dùng thư viện chuẩn.

```java
import java.util.*;
import java.nio.file.*;
import java.util.concurrent.*;

public class JAVA07 {
    public static void main(String[] args) {
        var internal=new ArrayList<>(List.of("Java"));
        var snapshot=List.copyOf(internal);
        internal.add("SQL");
        System.out.println(snapshot);
        try { snapshot.clear(); } catch(UnsupportedOperationException e) { System.out.println("read-only"); }
        System.out.println(internal);
    }
}
```

**Diễn giải từng bước:**

1. List.copyOf chụp phần tử tại thời điểm gọi.
2. Thêm vào internal không làm snapshot thay đổi.
3. clear trên snapshot bị từ chối; dữ liệu nội bộ vẫn đủ hai phần tử.

**Kết quả:**

```text
[Java]
read-only
[Java, SQL]
```

## Lỗi thường gặp

**Nhận biết:** Caller clear làm mất danh mục, hoặc wrapper thay đổi theo list gốc.

**Cách sửa:** Trả bản sao bất biến; nếu phần tử mutable cần sao chép sâu hoặc object bất biến.

## Kiểm tra hiểu bài

Collections.unmodifiableList(internal) có giữ [Java] sau internal.add không?

Viết dự đoán và lý do trước khi mở đáp án. Thay một đầu vào trong ví dụ, dự đoán lại rồi chạy.

## Thực hành liên quan

JP09, JP16, P1.2. Mở đề, kiểm tiên quyết, dùng gợi ý từng mức nếu cần; lưu expected/actual và output của lệnh kiểm tra. Không dùng kết quả của ví dụ hoặc solution để thay bằng chứng trên bài tự làm.
