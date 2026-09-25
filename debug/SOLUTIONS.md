# Lời giải sửa lỗi

Mã đầy đủ: [solution/Bugs.java](solution/Bugs.java).

| Bài | Nguyên nhân | Bản sửa và điều cần nhớ |
| --- | --- | --- |
| B01 | `put` trả giá trị cũ nhưng vẫn ghi đè | `putIfAbsent`, nếu đã tồn tại thì ném lỗi; original phải còn nguyên |
| B02 | Hai toán hạng int được nhân trước khi gán vào long | `(long) page * size`; page ngoài phạm vi trả danh sách rỗng |
| B03 | Chỉ xét tồn tại | Kiểm tra cả owner lấy từ principal; cùng trả Missing cho sai quyền và không tồn tại |
| B04 | Mọi lỗi đều được retry | Chỉ 429/503 theo hợp đồng lab, tối đa hai attempts |
| B05 | Lần xuất hiện cũ ở ngoài cửa sổ làm left lùi | `Math.max(left, old + 1)` giữ invariant |
| B06 | `limit` loại bớt ứng viên trước khi lọc | Lọc owner rồi limit; còn phải kiểm tra nguồn khi sinh câu trả lời |
| B07 | Long overflow khiến tổng đổi dấu | `input <= limit && output <= limit - input`, sau khi loại số âm |
| B08 | `while(true)` không giới hạn attempt | Vòng lặp có bộ đếm; lỗi sau attempt thứ hai được ném ra ngoài |

Mẫu giải thích B03: “The lookup checked only whether the document existed. I added an ownership check using the authenticated user. The regression test now rejects access by another user.”