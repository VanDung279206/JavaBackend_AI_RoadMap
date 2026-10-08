# QUALITY02 — Xác thực và phân quyền

## Mục tiêu và kiến thức trước

Tách ai đang gọi khỏi họ được làm gì; kiểm owner trên mọi đường đọc/ghi.

**Cần biết trước:** SPRING02; HTTP status.

## Tình huống

Người dùng Binh đã đăng nhập nhưng tài liệu thuộc An. Đăng nhập thành công không cấp quyền đọc.

## Ví dụ chạy được

Lệnh từ gốc repository: `java learning/examples/QUALITY02.java`. Java cần JDK 17+; ví dụ Python dùng thư viện chuẩn.

```java
import java.util.*;
import java.nio.file.*;
import java.util.concurrent.*;

public class QUALITY02 {
    static int access(String caller,String owner) { if(caller==null) return 401; if(!caller.equals(owner)) return 403; return 200; }
    public static void main(String[] args) {
        System.out.println(access(null,"an"));
        System.out.println(access("binh","an"));
        System.out.println(access("an","an"));
    }
}
```

**Diễn giải từng bước:**

1. null biểu diễn chưa xác thực, bị chặn ở biên.
2. Binh có danh tính nhưng khác owner nên bị từ chối.
3. An được xem. Trong API thật xác thực token/session, query scope owner và test cả list/detail/update/delete/AI; ví dụ chỉ mô phỏng quyết định.

**Kết quả:**

```text
401
403
200
```

## Lỗi thường gặp

**Nhận biết:** ID hợp lệ là trả dữ liệu mà không kiểm chủ; list an toàn nhưng detail/summary bị hở.

**Cách sửa:** Kiểm quyền trong service/query trước dữ liệu và trước retrieval; contract có thể dùng 404 thay 403 cho tài liệu riêng.

## Kiểm tra hiểu bài

Admin có quyền gì nếu không định nghĩa vai trò trong hợp đồng?

Viết dự đoán và lý do trước khi mở đáp án. Thay một đầu vào trong ví dụ, dự đoán lại rồi chạy.

## Thực hành liên quan

P4.2. Mở đề, kiểm tiên quyết, dùng gợi ý từng mức nếu cần; lưu expected/actual và output của lệnh kiểm tra. Không dùng kết quả của ví dụ hoặc solution để thay bằng chứng trên bài tự làm.
