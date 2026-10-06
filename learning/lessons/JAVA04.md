# JAVA04 — List và tìm phần tử

## Mục tiêu và kiến thức trước

Trace thứ tự/chỉ số và xử lý trường hợp không tìm thấy.

**Cần biết trước:** JAVA02–JAVA03; vòng lặp.

## Tình huống

Người dùng xóa tài liệu thứ hai. Những tài liệu sau dịch vị trí, nên index không phải ID bền vững.

## Ví dụ chạy được

Lệnh từ gốc repository: `java learning/examples/JAVA04.java`. Java cần JDK 17+; ví dụ Python dùng thư viện chuẩn.

```java
import java.util.*;
import java.nio.file.*;
import java.util.concurrent.*;

public class JAVA04 {
    public static void main(String[] args) {
        var ids=new ArrayList<>(List.of(10L,20L,30L));
        ids.remove(1);
        ids.add(40L);
        System.out.println(ids);
        System.out.println(ids.contains(20L));
    }
}
```

**Diễn giải từng bước:**

1. List giữ thứ tự và index bắt đầu từ 0.
2. remove(1) xóa phần tử ở index 1, giá trị 20.
3. 30 dịch về index 1; thêm 40 ở cuối; contains không thấy 20.

**Kết quả:**

```text
[10, 30, 40]
false
```

## Lỗi thường gặp

**Nhận biết:** Xóa nhầm giá trị vì overload remove(int); hoặc skip blank liên tiếp.

**Cách sửa:** Phân biệt index và identity; khi xóa trong vòng lặp dùng iterator, removeIf hoặc duyệt lùi.

## Kiểm tra hiểu bài

Sau xóa, ID 30 ở index nào? Có nên dùng index làm ID?

Viết dự đoán và lý do trước khi mở đáp án. Thay một đầu vào trong ví dụ, dự đoán lại rồi chạy.

## Thực hành liên quan

JP04, JP05, JP17. Mở đề, kiểm tiên quyết, dùng gợi ý từng mức nếu cần; lưu expected/actual và output của lệnh kiểm tra. Không dùng kết quả của ví dụ hoặc solution để thay bằng chứng trên bài tự làm.
