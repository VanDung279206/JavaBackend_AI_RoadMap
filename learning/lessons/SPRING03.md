# SPRING03 — Persistence, phân trang và optimistic locking

## Mục tiêu và kiến thức trước

Hiểu lưu trữ, version và ranh giới transaction; nối mô phỏng với JPA thật.

**Cần biết trước:** SQL02 và SPRING01–SPRING02.

## Tình huống

Hai request đọc cùng phiên bản rồi cùng đổi tiêu đề. Phiên sau phải nhận conflict.

## Ví dụ chạy được

Lệnh từ gốc repository: `java learning/examples/SPRING03.java`. Java cần JDK 17+; ví dụ Python dùng thư viện chuẩn.

```java
import java.util.*;
import java.nio.file.*;
import java.util.concurrent.*;

public class SPRING03 {
    record Row(String title,long version) {}
    public static void main(String[] args) {
        var database=new HashMap<Long,Row>(); database.put(1L,new Row("Java",0));
        long expected=0;
        Row current=database.get(1L);
        if(current.version()==expected) database.put(1L,new Row("SQL",current.version()+1));
        System.out.println(database.get(1L));
        System.out.println(database.get(1L).version()==expected ? "update" : "409 conflict");
    }
}
```

**Diễn giải từng bước:**

1. Map mô phỏng bảng để nhìn rõ version; dữ liệu này không bền và không bảo vệ race.
2. Cập nhật đầu dùng version 0 tạo version 1.
3. Request cũ expected=0 bị từ chối. JPA thật dùng @Entity, @Id, @Version, @Transactional; P3.3–P3.4 kiểm paging và rollback trên bản tự làm.

**Kết quả:**

```text
Row[title=SQL, version=1]
409 conflict
```

## Lỗi thường gặp

**Nhận biết:** Request sau ghi đè bản mới; hoặc đếm Maven PASS là PostgreSQL PASS.

**Cách sửa:** Dùng kiểm version nguyên tử trong database; ghi bằng chứng profile/DB thật. Paging phải có order ổn định và kiểm overflow offset.

## Kiểm tra hiểu bài

Chỉ so version rồi put trong Map có bảo vệ hai thread không?

Viết dự đoán và lý do trước khi mở đáp án. Thay một đầu vào trong ví dụ, dự đoán lại rồi chạy.

## Thực hành liên quan

P3.3, P3.4, F01. Mở đề, kiểm tiên quyết, dùng gợi ý từng mức nếu cần; lưu expected/actual và output của lệnh kiểm tra. Không dùng kết quả của ví dụ hoặc solution để thay bằng chứng trên bài tự làm.
