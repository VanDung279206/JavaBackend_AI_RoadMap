# Tám bài sửa lỗi
Sửa `starter/Bugs.java`; kiểm thử đã có trong `tests/BugChecks.java`. Chạy từ gốc repo:

```bash
python3 scripts/check.py --track debug --id B01
python3 scripts/check.py --track debug --mode solution
```

Windows: thay `python3` bằng `py`. Mặc định chạy **mã lỗi của bạn**; test đỏ trước khi sửa là kết quả mong đợi. Không thay assertion để làm test xanh. Mỗi bài cần: input tái hiện → nguyên nhân → bản sửa nhỏ nhất → test hồi quy → giải thích 3 câu tiếng Anh.

| ID | Triệu chứng | Input cần quan sát | Câu hỏi tự nhớ |
| --- | --- | --- | --- |
| B01 | ID cũ bị ghi đè | Thêm hai tài liệu ID=1 | Hàm Map nào ngăn ghi đè? |
| B02 | Page rất lớn gây lỗi | page=2147483647,size=100 | Ép kiểu trước hay sau phép nhân? |
| B03 | Đọc được tài liệu của người khác | owner=1, principal=2 | Quyền được kiểm tra tại đâu? |
| B04 | Lỗi 400 bị gọi lại | gateway luôn trả 400 | Lỗi nào trong hợp đồng được retry? |
| B05 | `abba` bị tính quá dài | Lần gặp `a` cuối | Con trỏ trái có được lùi không? |
| B06 | Thiếu kết quả dù còn tài liệu hợp lệ | X khác chủ đứng trước A,B | Lọc quyền trước hay sau top-k? |
| B07 | Tổng token quá lớn vẫn hợp lệ | MAX_VALUE + 1 | Phép cộng số nguyên có thể làm gì? |
| B08 | Retry không dừng | gateway luôn trả 503 | Tối đa hai **attempts** nghĩa là mấy retry? |

B08 có watchdog giả lập trong test: sau 3 lần gọi, nó ném lỗi khác để thoát vòng lặp. Runner còn có timeout 30 giây. Watchdog thuộc test; lời giải đúng phải tự dừng sau 2 attempts.

Xem [lời giải](SOLUTIONS.md) sau khi đã ghi dự đoán.