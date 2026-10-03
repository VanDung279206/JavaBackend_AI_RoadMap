# Lời giải RAG an toàn theo hợp đồng

Mã: [RagSafetyLab.java](solution/RagSafetyLab.java). Chạy `python3 scripts/check.py --track advanced --mode solution` chỉ kiểm bản tham chiếu.

## A01 — Trừ ngân sách còn lại

Giữ remaining không âm, kiểm count>remaining trước mỗi phép trừ. Cách này không cần cộng các số long có thể overflow. Reserve được trừ ngay đầu nên không nhầm context là toàn bộ ngân sách cho prompt. Model config phải có phiên bản quản lý ngoài mã; unit test chỉ xác minh số học.

## A02 — Kiểm chứng trước khi sinh câu trả lời

Lọc owner và version trước xử lý claim. Trả abstain khi thiếu hoặc mâu thuẫn; không chọn tùy ý nguồn đầu tiên. Citation chỉ gồm nguồn được chấp nhận. Không đưa claim vào lệnh thực thi. Đây là một hàng rào kiểm chứng deterministic; prompt injection trong tài liệu cùng owner vẫn cần kiểm thử model và giới hạn tool ở server.

## A03 — Publish có điều kiện

Thực hiện công việc tốn thời gian ngoài synchronized; giữ kiểm tra version và ghi chunk trong cùng critical section. edit xóa chunk cũ ngay để stale evidence không tiếp tục xuất hiện. List.copyOf giữ snapshot bất biến. Supplier lỗi làm future exceptional, không lưu kết quả rỗng như thành công. Chuyển sang database cần compare-and-set trong transaction và job idempotent; queue RAM mất khi process chết.
