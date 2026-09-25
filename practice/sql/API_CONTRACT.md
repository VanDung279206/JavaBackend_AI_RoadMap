# P2.1 — Tự viết hợp đồng API

Điền bảng; đối chiếu lời giải phase 2 và `projects/knowledge-assistant/requests.http`.

| Thao tác | Method/path | Request | Thành công | Input sai | Chưa đăng nhập | Sai owner |
| --- | --- | --- | --- | --- | --- | --- |
| Tạo | TODO | TODO | TODO | TODO | TODO | Không lấy owner từ body |
| Đọc ID | TODO | TODO | TODO | TODO | TODO | TODO |
| Xóa ID | TODO | TODO | TODO | TODO | TODO | TODO |

Tiêu chí: tạo 201 + Location; đọc 200; xóa 204; input sai 400; chưa xác thực 401; ID không tồn tại/sai owner 404. 409 dùng cho xung đột trạng thái, không thay cho 400. Đây là bài thiết kế cần tự giải thích; không có bộ chấm tự động giả định hiểu nội dung Markdown.
