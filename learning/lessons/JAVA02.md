# JAVA02 — Class, object và tham chiếu

## Mục tiêu và kiến thức trước

Phân biệt bản thiết kế, instance và biến tham chiếu.

**Cần biết trước:** JAVA01; biết gọi phương thức.

## Tình huống

Hai màn hình cùng hiển thị một danh mục. Gán biến không tạo một danh mục độc lập.

## Ví dụ chạy được

Lệnh từ gốc repository: `java learning/examples/JAVA02.java`. Java cần JDK 17+; ví dụ Python dùng thư viện chuẩn.

```java
import java.util.*;
import java.nio.file.*;
import java.util.concurrent.*;

public class JAVA02 {
    static final class Shelf { final List<String> titles=new ArrayList<>(); }
    public static void main(String[] args) {
        Shelf first=new Shelf();
        Shelf second=first;
        second.titles.add("Java");
        Shelf independent=new Shelf();
        System.out.println(first.titles.size()+":"+second.titles.size()+":"+independent.titles.size());
    }
}
```

**Diễn giải từng bước:**

1. new Shelf tạo object có list riêng.
2. second=first sao chép tham chiếu; hai biến trỏ cùng object.
3. Thêm qua second thấy được qua first; independent trỏ object mới.

**Kết quả:**

```text
1:1:0
```

## Lỗi thường gặp

**Nhận biết:** Một thay đổi qua biến b xuất hiện qua a dù bạn nghĩ đã sao chép.

**Cách sửa:** Vẽ biến → object. Muốn danh mục độc lập phải tạo mới và xác định sao chép nông/sâu.

## Kiểm tra hiểu bài

Có bao nhiêu Shelf và bao nhiêu biến tham chiếu trong main?

Viết dự đoán và lý do trước khi mở đáp án. Thay một đầu vào trong ví dụ, dự đoán lại rồi chạy.

## Thực hành liên quan

JP02, JP07. Mở đề, kiểm tiên quyết, dùng gợi ý từng mức nếu cần; lưu expected/actual và output của lệnh kiểm tra. Không dùng kết quả của ví dụ hoặc solution để thay bằng chứng trên bài tự làm.
