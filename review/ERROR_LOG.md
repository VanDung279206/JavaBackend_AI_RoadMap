# Nhật ký lỗi

Ghi lỗi thực tế, không chỉ ghi “chưa hiểu”. Mỗi lỗi cần một ca kiểm tra để nhận ra khi nó xuất hiện lại.

| Mã bài | Input gây lỗi | Kỳ vọng | Kết quả thực tế | Nguyên nhân đã xác minh | Sửa thế nào | Ngày làm lại |
| --- | --- | --- | --- | --- | --- | --- |
| Điền mã | Input nhỏ nhất tái hiện lỗi | Kết quả đúng | Điều đã quan sát | Nguyên nhân | Thay đổi và kiểm tra | Điền ngày |

Ví dụ minh họa: D04, input `abba`, kỳ vọng 2, mã sai trả 3, nguyên nhân left bị kéo lùi, sửa thành `max(left,last+1)`. Đây là ví dụ của người soạn; chưa phải lỗi thực tế của người học.