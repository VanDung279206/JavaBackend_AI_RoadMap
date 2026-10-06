# Dự án của tôi

Knowledge Assistant là dự án mẫu để tham khảo. Bạn có thể tự chọn vấn đề, dữ liệu và luồng nghiệp vụ; dùng `/projects/mine` trên website để tạo, sửa, lưu đề cương trên thiết bị theo tài khoản/khách và tải Markdown. Đề cương là kế hoạch, chưa phải sản phẩm hoặc bằng chứng hoàn thành. Dữ liệu này chưa đồng bộ lên máy chủ; tải bản sao để chuyển máy.

## 1. Chọn vấn đề

Viết: ai dùng, họ đang gặp khó khăn gì, ứng dụng giúp họ làm việc gì và một dấu hiệu cho thấy vấn đề được giải quyết. Ví dụ: thành viên khu dân cư cần tìm và mượn dụng cụ còn trống vào một khoảng thời gian.

| Ý tưởng | Quy tắc nên luyện | Hướng sáng tạo |
| --- | --- | --- |
| Mượn đồ trong cộng đồng | Không đặt trùng thời gian; bàn giao và hoàn trả | Danh sách chờ, điều kiện bàn giao |
| Tổ chức nhóm học | Vai trò, lịch học, trạng thái tham gia | Ghép lịch phù hợp, hỏi đáp tài liệu |
| Theo dõi chi tiêu | Danh mục, ngân sách, giao dịch | Báo cáo theo mục tiêu cá nhân |

Các đề tài chỉ gợi mở; người học tự quyết mô hình dữ liệu và luồng nghiệp vụ.

## 2. Chốt phạm vi

Chọn **ba chức năng chính**, một điểm khác biệt, và danh sách để sau. Viết mỗi user story: “Là [vai trò], tôi muốn [thao tác] để [lợi ích]”, kèm điều kiện chấp nhận bình thường và lỗi. Tránh thêm AI chỉ để có AI.

## 3. Thiết kế

- Entity, field, identity, liên kết, invariant và quy tắc cập nhật.
- API: method/path, request/response, status, pagination và thứ tự.
- Ma trận vai trò/owner cho đọc, tạo, cập nhật, xóa và các chức năng AI.
- Ca lỗi: dữ liệu sai, không tồn tại, ID trùng, vượt quyền, stale update, timeout, thiếu dữ liệu.
- Quyết định thiết kế: chọn gì, phương án khác, lý do và giới hạn.

## 4. Mốc theo chặng

| Chặng | Một phần chạy được | Bằng chứng |
| --- | --- | --- |
| Java | CLI xử lý một entity và một invariant; save/load | Input/output, ca sai, snapshot và file UTF-8 |
| HTTP & SQL | Hợp đồng API và schema/truy vấn | JOIN, constraints, rollback và dữ liệu sau restart |
| Spring Boot | Controller/service/repository, DTO, persistence | HTTP test, validation, paging, version và rollback |
| Kiểm thử & vận hành | Quyền, test, cấu hình, Docker và CI | Hai danh tính, clone sạch, healthcheck, CI URL/commit |
| AI | Chức năng hữu ích hoặc lab gateway riêng | Fake deterministic, output validation, timeout/retry; ghi fake/live |
| RAG | Retrieval trong dự án hoặc lab độc lập | Dataset, nguồn kỳ vọng, ca thiếu dữ liệu, quyền và đánh giá |

Nếu sản phẩm không cần hỏi đáp tài liệu, hoàn thành RAG bằng lab riêng. Đề cương ghi rõ lựa chọn này và bộ dữ liệu lab; không phải ép thêm tính năng vào sản phẩm.

## 5. Nộp bằng chứng và đánh giá chung

Nộp repository/commit, test và output thực, hướng dẫn chạy, demo, cùng giải thích ít nhất ba quyết định thiết kế. Mỗi tiêu chí chấm 0 (thiếu), 1 (có nhưng thiếu ca biên/bằng chứng) hoặc 2 (tái hiện và giải thích được); không cộng điểm chỉ vì chọn đề tài lớn hoặc giống mẫu.

| Kỹ năng | Điều kiện mức 2 |
| --- | --- |
| Thiết kế dữ liệu | Identity/liên kết/invariant hợp lý; constraints và cập nhật được kiểm tra |
| API rõ ràng | Request/response/status nhất quán; paging và trường hợp vắng dữ liệu |
| Xử lý lỗi | Ca validation/trùng/stale/timeout không làm hỏng trạng thái |
| Kiểm thử | Assert hợp đồng, ca biên và regression; tách unit/integration |
| Quyền truy cập | Test hai danh tính, vai trò/owner trên cả đọc/ghi/AI/retrieval |
| Chạy lại | Clone sạch, env mẫu, lệnh rõ, test/demo lặp lại được |

Không dùng một tổng điểm để bỏ qua lỗ hổng quyền hoặc không chạy lại được. Người đánh giá phải xem bằng chứng cho từng tiêu chí. Kiểm AI/RAG riêng: retrieval và câu trả lời đúng nguồn là hai kết quả khác nhau. Bài lab fake không chứng minh model thật đã chạy.

## Mẫu đề cương

```markdown
# [Tên dự án]
## Người dùng, vấn đề và mục tiêu
## Phạm vi: ba chức năng, một điểm khác biệt, để sau
## User stories và điều kiện chấp nhận
## Dữ liệu, quy tắc nghiệp vụ, API, quyền và ca lỗi
## Sáu mốc chạy được và bằng chứng từng mốc
## AI/RAG trong sản phẩm hoặc lab riêng: lý do
## Repository, test, hướng dẫn chạy, demo
## Quyết định thiết kế và checklist kỹ năng
```
