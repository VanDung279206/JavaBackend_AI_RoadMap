# QUALITY01 — Chọn ca kiểm thử từ hợp đồng

## Mục tiêu và kiến thức trước

Chọn ca thường, biên, sai, và trạng thái sau lỗi; biết test chứng minh điều gì.

**Cần biết trước:** Java và HTTP/SQL; expected/actual.

## Tình huống

Hàm ID chỉ nhận số dương. Test với mỗi số 1 không phát hiện chấp nhận 0 hoặc số âm.

## Ví dụ chạy được

Lệnh từ gốc repository: `java learning/examples/QUALITY01.java`. Java cần JDK 17+; ví dụ Python dùng thư viện chuẩn.

```java
import java.util.*;
import java.nio.file.*;
import java.util.concurrent.*;

public class QUALITY01 {
    static long validate(long id) { if(id<=0) throw new IllegalArgumentException(); return id; }
    public static void main(String[] args) {
        if(validate(1)!=1) throw new AssertionError("valid");
        for(long id:new long[]{0,-1}) {
            boolean rejected=false;
            try { validate(id); } catch(IllegalArgumentException e) { rejected=true; }
            if(!rejected) throw new AssertionError("boundary");
        }
        System.out.println("3 cases passed");
    }
}
```

**Diễn giải từng bước:**

1. Ca hợp lệ kiểm kết quả trả về.
2. 0 là biên, -1 đại diện miền sai; fail nếu không ném lỗi.
3. AssertionError không phụ thuộc tùy chọn -ea; P4.1 chuyển sang JUnit/API regression trong dự án.

**Kết quả:**

```text
3 cases passed
```

## Lỗi thường gặp

**Nhận biết:** Test chỉ gọi phương thức mà không assert; kiểm đúng exception nhưng quên dữ liệu bị đổi.

**Cách sửa:** Lập bảng input/expected, thêm trạng thái sau lỗi; unit kiểm luật, integration kiểm DB/HTTP thật.

## Kiểm tra hiểu bài

Ba test này có chứng minh API phân quyền đúng không?

Viết dự đoán và lý do trước khi mở đáp án. Thay một đầu vào trong ví dụ, dự đoán lại rồi chạy.

## Thực hành liên quan

P4.1, JP17, JP18. Mở đề, kiểm tiên quyết, dùng gợi ý từng mức nếu cần; lưu expected/actual và output của lệnh kiểm tra. Không dùng kết quả của ví dụ hoặc solution để thay bằng chứng trên bài tự làm.
