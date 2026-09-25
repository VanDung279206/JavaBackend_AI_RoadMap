# Nhận diện dạng bài và tự ôn

| Dấu hiệu trong đề | Pattern nên thử | Bài | Câu hỏi nhớ lại |
| --- | --- | --- | --- |
| Đếm số lần, tra theo khóa | Hash map | D01–D02 | Khóa là gì? Giá trị lưu điều gì? |
| So hai đầu chuỗi/mảng | Two pointers | D03 | Điều gì đã đúng ở phần đã đi qua? |
| Đoạn liên tiếp phải thỏa điều kiện | Sliding window | D04 | Khi thêm phần tử mới, khi nào thu hẹp? |
| Nhiều query tổng trên dữ liệu cố định | Prefix sum | D05 | Vì sao cần n+1 phần tử? |
| Lồng nhau, phần mới nhất xử lý trước | Stack | D06 | Vì sao chỉ đếm không đủ? |
| Dữ liệu đã sắp hoặc điều kiện đơn điệu | Binary search | D07 | Khoảng đang giữ là đóng hay nửa mở? |
| Khoảng thời gian giao nhau | Sort + merge | D08 | Đầu mút chạm nhau có gộp không? |
| Chỉ cần k phần tử tốt nhất | Heap | D09 | Đỉnh heap nên là phần tử nào bị loại? |
| Số cạnh ít nhất, không trọng số | BFS | D10 | Khi nào đánh dấu đã thăm? |
| Bài lớn lặp lại bài con | Dynamic programming | D11 | Trạng thái và base case là gì? |
| Loại phần tử lâu không được truy cập | Hash map + thứ tự truy cập | D12 | get có thay đổi thứ tự không? |

## Mẫu giải thích một lời giải
1. Input và các điều kiện của input.
2. Cách đơn giản nhất và điểm tốn kém.
3. Cấu trúc dữ liệu chọn, cùng dữ liệu nó giữ.
4. Invariant: điều luôn đúng sau mỗi bước.
5. Vì sao khi kết thúc nhận được đáp án.
6. Độ phức tạp thời gian/bộ nhớ và giả định đi kèm.
7. Một ví dụ bình thường, một ví dụ rỗng/biên và một phản ví dụ cho cách sai.

## Thứ tự đề xuất
Học D01–D04 cùng phase 1; D05,D07 cùng phase 2; D06,D08 cùng phase 3; D09,D12 cùng phase 4; củng cố D09,D12 trong phase 5; D10,D11 trong giai đoạn phase 6. Đây là cách phân bổ học tập, không có nghĩa mọi backend đều cần dùng mọi thuật toán này.

Mỗi lần ôn chọn một bài mới và một bài đã học. Tự viết lại, đối chiếu test, rồi ghi lỗi vào [ERROR_LOG.md](../review/ERROR_LOG.md).