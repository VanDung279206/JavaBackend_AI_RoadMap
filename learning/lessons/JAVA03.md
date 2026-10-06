# JAVA03 — Constructor và validation

## Mục tiêu và kiến thức trước

Giữ invariant ngay khi tạo object và xử lý lỗi có chủ đích.

**Cần biết trước:** JAVA02; if, null và String.

## Tình huống

Danh mục không được có tài liệu ID âm hoặc tiêu đề trắng. Constructor chặn object sai trước khi lưu.

## Ví dụ chạy được

Lệnh từ gốc repository: `java learning/examples/JAVA03.java`. Java cần JDK 17+; ví dụ Python dùng thư viện chuẩn.

```java
import java.util.*;
import java.nio.file.*;
import java.util.concurrent.*;

public class JAVA03 {
    record Document(long id,String title) {
        Document { if(id<=0 || title==null || title.isBlank()) throw new IllegalArgumentException("invalid document"); title=title.strip(); }
    }
    public static void main(String[] args) {
        var doc=new Document(1," Java ");
        System.out.println(doc.id()+":"+doc.title());
        try { new Document(0," "); } catch(IllegalArgumentException e) { System.out.println(e.getMessage()); }
    }
}
```

**Diễn giải từng bước:**

1. Constructor kiểm ID và title; || tránh gọi isBlank trên null.
2. title.strip() gán giá trị đã chuẩn hóa cho component của record.
3. Lần tạo thứ hai ném lỗi trước khi object được trả về; caller nhận biết qua catch.

**Kết quả:**

```text
1:Java
invalid document
```

## Lỗi thường gặp

**Nhận biết:** NullPointerException tại title.isBlank hoặc dữ liệu sai vẫn được lưu.

**Cách sửa:** Kiểm null trước; validate tất cả đường tạo. Trong PilotLab, create là cổng validation; không bỏ qua nó.

## Kiểm tra hiểu bài

Nếu chỉ kiểm title==null thì chuỗi "   " có bị từ chối không?

Viết dự đoán và lý do trước khi mở đáp án. Thay một đầu vào trong ví dụ, dự đoán lại rồi chạy.

## Thực hành liên quan

JP03, JP07, JP10, P1.1. Mở đề, kiểm tiên quyết, dùng gợi ý từng mức nếu cần; lưu expected/actual và output của lệnh kiểm tra. Không dùng kết quả của ví dụ hoặc solution để thay bằng chứng trên bài tự làm.
