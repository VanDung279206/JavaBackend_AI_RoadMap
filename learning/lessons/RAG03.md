# RAG03 — Nguồn trích dẫn, thiếu dữ liệu và đánh giá

## Mục tiêu và kiến thức trước

Validate citation thuộc context được phép; biết từ chối khi thiếu bằng chứng.

**Cần biết trước:** RAG02 và AI02.

## Tình huống

Model viết câu trả lời trôi chảy nhưng dẫn chunk không hề retrieve. Hệ thống phải từ chối nguồn bịa.

## Ví dụ chạy được

Lệnh từ gốc repository: `java learning/examples/RAG03.java`. Java cần JDK 17+; ví dụ Python dùng thư viện chuẩn.

```java
import java.util.*;
import java.nio.file.*;
import java.util.concurrent.*;

public class RAG03 {
    static String verify(Set<String> retrieved,String citation) {
        if(retrieved.isEmpty()) return "insufficient data";
        return retrieved.contains(citation) ? "citation allowed" : "reject unknown source";
    }
    public static void main(String[] args) {
        System.out.println(verify(Set.of("d1:c1"),"d1:c1"));
        System.out.println(verify(Set.of("d1:c1"),"d9:c2"));
        System.out.println(verify(Set.of(),"d1:c1"));
    }
}
```

**Diễn giải từng bước:**

1. Chỉ citation trong context được phép mới vượt kiểm cấu trúc.
2. Citation khác context bị chặn; context rỗng luôn thiếu dữ liệu.
3. Nguồn tồn tại vẫn chưa chứng minh câu trả lời được nguồn hỗ trợ: chấm relevance, faithfulness, thiếu dữ liệu, quyền và stale version bằng bộ câu hỏi cố định.

**Kết quả:**

```text
citation allowed
reject unknown source
insufficient data
```

## Lỗi thường gặp

**Nhận biết:** Coi có citation là đúng; không có dữ liệu vẫn bịa đáp án; update tài liệu nhưng dùng chunk cũ.

**Cách sửa:** Kiểm doc/chunk/version/quyền và đối chiếu nội dung; thêm ca không có đáp án và đo trước/sau thay retrieval.

## Kiểm tra hiểu bài

citation allowed có đồng nghĩa câu trả lời chính xác không?

Viết dự đoán và lý do trước khi mở đáp án. Thay một đầu vào trong ví dụ, dự đoán lại rồi chạy.

## Thực hành liên quan

P6.3, P6.4, A01. Mở đề, kiểm tiên quyết, dùng gợi ý từng mức nếu cần; lưu expected/actual và output của lệnh kiểm tra. Không dùng kết quả của ví dụ hoặc solution để thay bằng chứng trên bài tự làm.
