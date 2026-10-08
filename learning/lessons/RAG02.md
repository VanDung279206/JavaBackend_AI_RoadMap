# RAG02 — Retrieval trước khi sinh câu trả lời

## Mục tiêu và kiến thức trước

Lọc quyền trước top-k và đo retrieval bằng nguồn kỳ vọng.

**Cần biết trước:** RAG01, Map và phân quyền.

## Tình huống

Chunk của người khác có điểm cao hơn. Lọc sau top-k có thể lấy hết slot và làm mất chunk hợp lệ.

## Ví dụ chạy được

Lệnh từ gốc repository: `java learning/examples/RAG02.java`. Java cần JDK 17+; ví dụ Python dùng thư viện chuẩn.

```java
import java.util.*;
import java.nio.file.*;
import java.util.concurrent.*;

public class RAG02 {
    record Hit(String id,String owner,int score) {}
    public static void main(String[] args) {
        var hits=List.of(new Hit("private","binh",100),new Hit("allowed","an",80));
        var result=hits.stream().filter(h->h.owner().equals("an")).sorted(Comparator.comparingInt(Hit::score).reversed()).limit(1).map(Hit::id).toList();
        System.out.println(result);
        System.out.println(result.contains("allowed") ? "recall@1=1.0" : "recall@1=0.0");
    }
}
```

**Diễn giải từng bước:**

1. Query scope owner trước ranking/top-k.
2. Sắp điểm giảm và lấy k=1 trong tập được phép.
3. Nguồn expected=allowed được retrieve nên recall=1 cho một câu này; bộ thực cần nhiều câu, k cố định và cùng dataset.

**Kết quả:**

```text
[allowed]
recall@1=1.0
```

## Lỗi thường gặp

**Nhận biết:** Tài liệu đúng không được lấy dù có trong DB; hoặc lộ metadata chunk ngoài quyền.

**Cách sửa:** Lọc quyền tại retrieval query, ổn định tie-break, so cùng bộ câu hỏi; tách retrieval score khỏi chất lượng câu trả lời.

## Kiểm tra hiểu bài

Nếu lấy top-1 trước rồi mới lọc owner thì result là gì?

Viết dự đoán và lý do trước khi mở đáp án. Thay một đầu vào trong ví dụ, dự đoán lại rồi chạy.

## Thực hành liên quan

P6.2, P6.4. Mở đề, kiểm tiên quyết, dùng gợi ý từng mức nếu cần; lưu expected/actual và output của lệnh kiểm tra. Không dùng kết quả của ví dụ hoặc solution để thay bằng chứng trên bài tự làm.
