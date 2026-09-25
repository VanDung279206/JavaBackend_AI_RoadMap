# Dự án xuyên suốt: Knowledge Assistant

Đề xuất xây một backend quản lý tài liệu, sau đó bổ sung tóm tắt và hỏi đáp có nguồn. Phạm vi ban đầu sử dụng tài liệu văn bản hoặc Markdown để tập trung vào luồng xử lý.

## Các mốc

| Mốc | Chức năng cần xây | Cách kiểm tra |
| --- | --- | --- |
| A | Danh mục tài liệu trên terminal | Thêm, liệt kê, tìm, xóa; thử đầu vào sai |
| B | REST API và PostgreSQL | Dữ liệu tồn tại sau khi khởi động lại |
| C | Xác thực, phân quyền và kiểm thử | Hai người dùng không truy cập tài liệu của nhau |
| D | Tóm tắt bằng AI | Đầu ra có cấu trúc, xử lý lỗi và timeout |
| E | Hỏi đáp dựa trên tài liệu | Có nguồn, bộ đánh giá và ca thiếu dữ liệu |

## API đề xuất

| Endpoint | Ý nghĩa |
| --- | --- |
| `POST /documents` | Tạo tài liệu từ tiêu đề và nội dung |
| `GET /documents` | Liệt kê tài liệu được phép xem, có phân trang |
| `GET /documents/{id}` | Xem một tài liệu |
| `PUT /documents/{id}` | Cập nhật tài liệu và làm mới dữ liệu tìm kiếm liên quan |
| `DELETE /documents/{id}` | Xóa tài liệu và dữ liệu tìm kiếm liên quan |
| `POST /documents/{id}/summary` | Tóm tắt nội dung được phép truy cập |
| `POST /questions` | Hỏi đáp trên phạm vi tài liệu được cấp quyền |

Đây là hợp đồng đề xuất. Quy định cụ thể trường dữ liệu, status code, lỗi, cơ chế xác thực và tính đồng bộ/bất đồng bộ khi triển khai từng endpoint.

## Dữ liệu đề xuất

- Người dùng: ID và thông tin cần thiết cho cơ chế xác thực được chọn.
- Tài liệu: ID, chủ sở hữu, tiêu đề, nội dung, phiên bản, thời điểm cập nhật.
- Đoạn tài liệu: ID, document ID, nội dung đoạn và metadata phục vụ truy xuất.
- Embedding: vector gắn với đoạn và thông tin mô hình embedding đã sử dụng.
- Kết quả đánh giá: câu hỏi, nguồn kỳ vọng, kết quả thực tế và nhận xét.

## Nguyên tắc thiết kế

Ứng dụng Java kiểm tra quyền, truy xuất dữ liệu và quyết định phạm vi được gửi tới mô hình. Nội dung do mô hình trả về cần được kiểm tra trước khi dùng trong các bước xử lý tiếp theo.

Nguồn trả về phải truy ngược được về tài liệu và đoạn đã dùng. Thiết kế cách làm mới embedding khi tài liệu đổi nội dung hoặc đổi mô hình embedding.

## Bằng chứng cần có khi hoàn thành

- Hướng dẫn cài đặt, cấu hình và chạy lại.
- Ví dụ request/response cho từng chức năng chính.
- Kết quả kiểm thử nghiệp vụ, database và quyền truy cập.
- Bộ câu hỏi đánh giá với nguồn và đáp án kỳ vọng do người thực hiện xác nhận.
- Báo cáo các câu trả lời sai, thiếu nguồn hoặc truy xuất thất bại.
- Phiên bản Java, Spring Boot, Spring AI và mô hình đã dùng.

## Mã tham chiếu và bản tự làm

Ứng dụng hiện có ở [projects/knowledge-assistant](../projects/knowledge-assistant/README.md), với [các mốc kiểm chứng](../projects/knowledge-assistant/MILESTONES.md). Bản demo dùng H2 và tìm theo từ; PostgreSQL và Ollama/pgvector có profile riêng. Đây là mức triển khai học tập; tiêu chí dùng model thật chỉ được đánh dấu sau khi chạy thực tế.

## Bằng chứng bổ sung trước khi mô tả trong CV

- Nêu đúng phần tự triển khai và phần tham khảo; không coi chạy solution là tự xây dự án.
- Chứng minh stale update bằng hai request dùng cùng expectedVersion; giữ log một thành công, một409.
- Nếu mới chạy lab C02, mô tả là “thực hành chống xử lý lặp trong một JVM”, chưa ghi API có idempotency bền vững.
- Gắn báo cáo verify với commit thực tế của bạn. Để trống commit nếu chưa có; không lấy phiên kiểm tra soạn tài liệu làm CI của tài khoản bạn.
- AI live cần chấm câu trả lời dựa trên nguồn, kiểm tra câu không đủ dữ liệu, invalidation sau update và phân quyền; pass cấu trúc không chứng minh mọi câu trả lời đúng.