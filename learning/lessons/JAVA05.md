# JAVA05 — Map và đếm theo khóa

## Mục tiêu và kiến thức trước

Chọn Map khi cần tra cứu theo identity; hiểu put ghi đè.

**Cần biết trước:** JAVA04; generics cơ bản.

## Tình huống

Bạn muốn đếm số lần xuất hiện của từ trong tiêu đề. Mỗi từ là một khóa, số lượt là giá trị.

## Ví dụ chạy được

Lệnh từ gốc repository: `java learning/examples/JAVA05.java`. Java cần JDK 17+; ví dụ Python dùng thư viện chuẩn.

```java
import java.util.*;
import java.nio.file.*;
import java.util.concurrent.*;

public class JAVA05 {
    public static void main(String[] args) {
        var counts=new LinkedHashMap<String,Integer>();
        for(String word:List.of("java","sql","java")) counts.merge(word,1,Integer::sum);
        System.out.println(counts);
        counts.put("java",9);
        System.out.println(counts.get("java"));
    }
}
```

**Diễn giải từng bước:**

1. Map bắt đầu rỗng; merge thêm 1 nếu khóa vắng.
2. Lượt java thứ hai cộng giá trị cũ với 1.
3. put(java,9) thay giá trị hiện có; LinkedHashMap giữ thứ tự xuất hiện.

**Kết quả:**

```text
{java=2, sql=1}
9
```

## Lỗi thường gặp

**Nhận biết:** Đếm từ nào cũng được 1, hoặc put làm mất dữ liệu trước.

**Cách sửa:** Cập nhật từ giá trị cũ bằng merge/getOrDefault. Xác định rõ chính sách khi khóa đã tồn tại.

## Kiểm tra hiểu bài

Nếu dùng put(word,1) trong vòng, java cuối cùng bằng bao nhiêu?

Viết dự đoán và lý do trước khi mở đáp án. Thay một đầu vào trong ví dụ, dự đoán lại rồi chạy.

## Thực hành liên quan

JP06, JP08, JP16. Mở đề, kiểm tiên quyết, dùng gợi ý từng mức nếu cần; lưu expected/actual và output của lệnh kiểm tra. Không dùng kết quả của ví dụ hoặc solution để thay bằng chứng trên bài tự làm.
