# JAVA01 — Trace chương trình và phương thức

## Mục tiêu và kiến thức trước

Theo dõi biến qua từng dòng và mô tả hợp đồng một phương thức.

**Cần biết trước:** P0.2: chạy main; biết int và println.

## Tình huống

Bạn cần đếm nửa số trang ở từng nhóm. Trace giúp phân biệt lỗi phép chia với lỗi vòng lặp.

## Ví dụ chạy được

Lệnh từ gốc repository: `java learning/examples/JAVA01.java`. Java cần JDK 17+; ví dụ Python dùng thư viện chuẩn.

```java
import java.util.*;
import java.nio.file.*;
import java.util.concurrent.*;

public class JAVA01 {
    static int half(int pages) { return pages / 2; }
    public static void main(String[] args) {
        int total=0;
        for(int pages:new int[]{2,5,6}) {
            int value=half(pages);
            total+=value;
            System.out.println(pages+":"+value+":"+total);
        }
    }
}
```

**Diễn giải từng bước:**

1. main tạo total=0; mỗi vòng nhận pages tiếp theo.
2. half trả pages/2 bằng phép chia int; 5/2 là 2.
3. total nhận tổng prefix; println in pages, value, total sau cập nhật.

**Kết quả:**

```text
2:1:1
5:2:3
6:3:6
```

## Lỗi thường gặp

**Nhận biết:** Dự đoán 5/2=2.5 nhưng output là 2; hoặc total luôn bằng phần tử cuối.

**Cách sửa:** Xác định kiểu trước phép chia; muốn số thực dùng pages/2.0. Đặt total ngoài vòng lặp.

## Kiểm tra hiểu bài

Nếu total khai báo trong vòng lặp, ba dòng cuối cột total là gì?

Viết dự đoán và lý do trước khi mở đáp án. Thay một đầu vào trong ví dụ, dự đoán lại rồi chạy.

## Thực hành liên quan

JP01, JP03, JP18, P1.1. Mở đề, kiểm tiên quyết, dùng gợi ý từng mức nếu cần; lưu expected/actual và output của lệnh kiểm tra. Không dùng kết quả của ví dụ hoặc solution để thay bằng chứng trên bài tự làm.
