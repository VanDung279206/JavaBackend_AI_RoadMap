# RAG01 — Chunking và overlap

## Mục tiêu và kiến thức trước

Trace cửa sổ, bảo đảm tiến lên và giữ metadata nguồn.

**Cần biết trước:** List, chỉ số, string và validation.

## Tình huống

Tài liệu dài phải chia đoạn. Overlap giữ ngữ cảnh ở biên, nhưng overlap bằng size gây vòng lặp không tiến.

## Ví dụ chạy được

Lệnh từ gốc repository: `java learning/examples/RAG01.java`. Java cần JDK 17+; ví dụ Python dùng thư viện chuẩn.

```java
import java.util.*;
import java.nio.file.*;
import java.util.concurrent.*;

public class RAG01 {
    public static void main(String[] args) {
        String text="ABCDEFGHI"; int size=4,overlap=1;
        if(size<=0 || overlap<0 || overlap>=size) throw new IllegalArgumentException();
        for(int start=0;start<text.length();) {
            int end=Math.min(text.length(),start+size);
            System.out.println(start+":"+end+":"+text.substring(start,end));
            if(end==text.length()) break;
            start=end-overlap;
        }
    }
}
```

**Diễn giải từng bước:**

1. Cửa sổ đầu [0,4) lấy ABCD.
2. Bắt đầu tiếp = end-overlap, giữ lại D; bước tiến=size-overlap.
3. Đoạn cuối clamp end tới 9; break tránh tạo thêm chunk cuối trùng. Lưu docId/chunkId/offset/version trong dự án.

**Kết quả:**

```text
0:4:ABCD
3:7:DEFG
6:9:GHI
```

## Lỗi thường gặp

**Nhận biết:** Chunk thiếu ký tự biên, vòng lặp không dừng hoặc citation không tìm về tài liệu.

**Cách sửa:** Kiểm 0<=overlap<size, trace start/end; không nhầm đơn vị char với token model.

## Kiểm tra hiểu bài

Nếu overlap=4 và size=4 thì start tiếp là bao nhiêu?

Viết dự đoán và lý do trước khi mở đáp án. Thay một đầu vào trong ví dụ, dự đoán lại rồi chạy.

## Thực hành liên quan

P6.1. Mở đề, kiểm tiên quyết, dùng gợi ý từng mức nếu cần; lưu expected/actual và output của lệnh kiểm tra. Không dùng kết quả của ví dụ hoặc solution để thay bằng chứng trên bài tự làm.
