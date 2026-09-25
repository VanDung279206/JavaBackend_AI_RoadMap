# Lời giải Phase 5

Mã Java đầy đủ: [AiLab.java](../../labs/src/AiLab.java). Gateway giả lập cho kết quả xác định để học luồng xử lý; không mô phỏng chất lượng ngôn ngữ của LLM.

## P5.1

`Prompt(system,user)` giữ chỉ dẫn ở system và văn bản cần tóm tắt ở user. Kiểm tra input trước khi xây prompt. Có thể kiểm tra trường user vẫn chứa nguyên câu “Ignore previous instructions”, còn system vẫn là chỉ dẫn của ứng dụng.

Mẫu tích hợp sau khi đã cấu hình `ChatClient` và provider:

```java
var p = AiLab.prompt(documentText);
AiLab.Summary raw = chatClient.prompt()
    .system(p.system())
    .user(p.user())
    .call()
    .entity(AiLab.Summary.class);
AiLab.Summary summary = AiLab.validate(raw);
```

Đây là đoạn tích hợp Spring AI, không được thực thi trong bộ kiểm tra Java thuần. Cần kiểm tra khả năng structured output của model/provider đã chọn. Tách role hỗ trợ biểu đạt ý định; hệ thống vẫn cần giới hạn quyền và kiểm tra tác động của mọi thao tác phía backend.

## P5.2

Điều kiện `input <= limit && output <= limit - input` tránh phép cộng tràn `long`. Sau khi từ chối số âm, fixture lần lượt cho true, false, exception.

Không đếm token bằng số từ hoặc `String.length()`. Tokenizer và quy tắc tính phụ thuộc mô hình/provider. Công thức bài là mô hình học tập; cần đọc giới hạn input/output/context riêng của API thực tế.

## P5.3

Kiểm tra object null → title → danh sách bullet → từng bullet. Sau đó tạo record mới với `List.copyOf`. Ví dụ đúng cấu trúc nhưng sai nghĩa: nguồn ghi “mở cửa 9 giờ”, summary ghi “mở cửa 8 giờ”. Validator cấu trúc không phát hiện lỗi này.

Thử title rỗng, bullets null, 0 bullet, 4 bullet và một bullet trắng. Với danh sách hợp lệ ban đầu có một phần tử, sửa danh sách nguồn sau khi validate không được làm thay đổi kết quả.

## P5.4

Vòng lặp có attempt=1,2. Chỉ bắt `UpstreamFailure`; nếu status thuộc 429/503 và vẫn còn lượt thì thử lại, còn lại ném lỗi. Exception validation không bị bắt nên không retry ngoài ý muốn.

| Chuỗi kết quả gateway | Số lần gọi | Kết quả cuối |
| --- | --- | --- |
| Thành công | 1 | Summary đã validate |
| 503 → thành công | 2 | Summary đã validate |
| 503 → 503 | 2 | UpstreamFailure |
| 400 | 1 | UpstreamFailure |
| Output không hợp lệ | 1 | IllegalArgumentException |

Mã bài tập không chờ giữa các lần gọi. Adapter mạng thực tế cần timeout và backoff theo điều kiện provider, xử lý `Retry-After` khi áp dụng, giới hạn tổng thời gian và chi phí. Không áp dụng retry này trực tiếp cho tool có tác động ghi dữ liệu: cần thiết kế idempotency/kiểm soát tác động riêng.

Nguồn: [ChatClient](https://docs.spring.io/spring-ai/reference/api/chatclient.html), [Output Converters](https://docs.spring.io/spring-ai/reference/api/structured-output/converters.html).