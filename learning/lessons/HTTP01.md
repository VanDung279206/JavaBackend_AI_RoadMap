# HTTP01 — Request/response và hợp đồng API

## Mục tiêu và kiến thức trước

Đọc method, path, body, status và response; phân biệt lỗi dữ liệu với lỗi quyền.

**Cần biết trước:** Java validation; biết JSON và luồng client/server.

## Tình huống

Client gửi tiêu đề trắng. API phải trả lỗi có cấu trúc thay vì 200 với tài liệu sai.

## Ví dụ chạy được

Lệnh từ gốc repository: `java learning/examples/HTTP01.java`. Java cần JDK 17+; ví dụ Python dùng thư viện chuẩn.

```java
import java.util.*;
import java.nio.file.*;
import java.util.concurrent.*;

public class HTTP01 {
    record Request(String method,String path,String title) {}
    record Response(int status,String body) {}
    static Response handle(Request r) {
        if(!r.method().equals("POST") || !r.path().equals("/documents")) return new Response(404,"not found");
        if(r.title()==null || r.title().isBlank()) return new Response(400,"title required");
        return new Response(201,"created: "+r.title().strip());
    }
    public static void main(String[] args) {
        System.out.println(handle(new Request("POST","/documents"," ")));
        System.out.println(handle(new Request("POST","/documents","Java")));
    }
}
```

**Diễn giải từng bước:**

1. Ví dụ mô phỏng handler, không mở HTTP server. Request gồm method/path/payload.
2. Handler kiểm tuyến rồi validation trước tạo tài liệu.
3. Response chứa status cho client quyết định và body giải thích; áp dụng hợp đồng vào API thật ở P2.1.

**Kết quả:**

```text
Response[status=400, body=title required]
Response[status=201, body=created: Java]
```

## Lỗi thường gặp

**Nhận biết:** Dùng GET để mutation, trả 200 cho mọi lỗi hoặc nhầm 401/403.

**Cách sửa:** Ghi hợp đồng theo method/path; 401 thiếu xác thực, 403 thiếu quyền, 400 dữ liệu sai. Với tài liệu riêng có thể chọn 404 che sự tồn tại và ghi rõ.

## Kiểm tra hiểu bài

POST hợp lệ vì sao thường trả 201? HTTP status có thay validation không?

Viết dự đoán và lý do trước khi mở đáp án. Thay một đầu vào trong ví dụ, dự đoán lại rồi chạy.

## Thực hành liên quan

P2.1. Mở đề, kiểm tiên quyết, dùng gợi ý từng mức nếu cần; lưu expected/actual và output của lệnh kiểm tra. Không dùng kết quả của ví dụ hoặc solution để thay bằng chứng trên bài tự làm.
