# JAVA06 — Từ chối ID trùng trước mutation

## Mục tiêu và kiến thức trước

Định nghĩa identity và giữ dữ liệu cũ khi thao tác lỗi.

**Cần biết trước:** JAVA03 và JAVA05.

## Tình huống

Hai tài liệu dùng cùng ID. Catalog phải báo lỗi, không tự đổi tài liệu cũ sang nội dung mới.

## Ví dụ chạy được

Lệnh từ gốc repository: `java learning/examples/JAVA06.java`. Java cần JDK 17+; ví dụ Python dùng thư viện chuẩn.

```java
import java.util.*;
import java.nio.file.*;
import java.util.concurrent.*;

public class JAVA06 {
    static void add(Map<Long,String> docs,long id,String title) {
        if(id<=0 || title==null || title.isBlank()) throw new IllegalArgumentException("invalid");
        if(docs.containsKey(id)) throw new IllegalArgumentException("duplicate");
        docs.put(id,title.strip());
    }
    public static void main(String[] args) {
        var docs=new LinkedHashMap<Long,String>(); add(docs,1,"Java");
        try { add(docs,1,"SQL"); } catch(IllegalArgumentException e) { System.out.println(e.getMessage()); }
        System.out.println(docs);
    }
}
```

**Diễn giải từng bước:**

1. Lần thêm đầu validate và thấy ID vắng, rồi mới put.
2. Lần thêm hai gặp ID có sẵn và ném lỗi trước put.
3. Sau lỗi danh mục vẫn giữ Java. Đây là hợp đồng một luồng.

**Kết quả:**

```text
duplicate
{1=Java}
```

## Lỗi thường gặp

**Nhận biết:** Sau lỗi danh mục đổi thành SQL; kiểm trùng diễn ra sau ghi.

**Cách sửa:** Kiểm trước mutation và test trạng thái sau lỗi. Đồng thời cần khóa hoặc ràng buộc database; containsKey+put không đủ.

## Kiểm tra hiểu bài

Nếu hai thread cùng kiểm containsKey trước put thì có đảm bảo duy nhất không?

Viết dự đoán và lý do trước khi mở đáp án. Thay một đầu vào trong ví dụ, dự đoán lại rồi chạy.

## Thực hành liên quan

JP08, JP14, JP19, JP20, P1.2. Mở đề, kiểm tiên quyết, dùng gợi ý từng mức nếu cần; lưu expected/actual và output của lệnh kiểm tra. Không dùng kết quả của ví dụ hoặc solution để thay bằng chứng trên bài tự làm.
