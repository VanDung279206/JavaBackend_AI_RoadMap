# SPRING02 — DTO, validation và lỗi API

## Mục tiêu và kiến thức trước

Tách dữ liệu request/response khỏi entity và chặn field nhạy cảm.

**Cần biết trước:** SPRING01; record và validation.

## Tình huống

Client cần tạo tài liệu nhưng không được tự gửi owner để chiếm danh tính người khác.

## Ví dụ chạy được

Lệnh từ gốc repository: `java learning/examples/SPRING02.java`. Java cần JDK 17+; ví dụ Python dùng thư viện chuẩn.

```java
import java.util.*;
import java.nio.file.*;
import java.util.concurrent.*;

public class SPRING02 {
    record CreateDto(String title) {}
    record ResponseDto(long id,String title) {}
    public static void main(String[] args) {
        var request=new CreateDto(" Java ");
        String authenticatedOwner="an";
        if(request.title()==null || request.title().isBlank()) throw new IllegalArgumentException("title required");
        System.out.println(authenticatedOwner);
        System.out.println(new ResponseDto(1,request.title().strip()));
    }
}
```

**Diễn giải từng bước:**

1. CreateDto chỉ có trường client được phép đặt.
2. Owner lấy từ danh tính đã xác thực, không lấy trong body.
3. ResponseDto chọn field công khai; trong Spring dùng @Valid @RequestBody và @NotBlank; AppErrors ánh xạ lỗi thành status/body nhất quán.

**Kết quả:**

```text
an
ResponseDto[id=1, title=Java]
```

## Lỗi thường gặp

**Nhận biết:** Bind thẳng entity rồi trả tất cả field; client sửa owner/version tùy ý.

**Cách sửa:** DTO riêng cho input/output; validate cả biên HTTP và invariant service; đừng serialize proxy JPA trực tiếp.

## Kiểm tra hiểu bài

DTO có giúp tự xác thực người dùng không?

Viết dự đoán và lý do trước khi mở đáp án. Thay một đầu vào trong ví dụ, dự đoán lại rồi chạy.

## Thực hành liên quan

P3.2, P4.2. Mở đề, kiểm tiên quyết, dùng gợi ý từng mức nếu cần; lưu expected/actual và output của lệnh kiểm tra. Không dùng kết quả của ví dụ hoặc solution để thay bằng chứng trên bài tự làm.
