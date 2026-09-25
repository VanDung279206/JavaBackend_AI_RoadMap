# Đề trộn — tự chọn cách giải

Chưa mở thư mục `solution` hay file đáp án trước khi ghi lựa chọn. Null nằm ngoài hợp đồng của tám bài. Không sửa input. Với mỗi bài: nêu cách đơn giản, chọn cách làm đáp ứng giới hạn, trace một input biên, giải thích độ phức tạp, viết code và chạy test. Tên thuật toán không được cho trong đề.

| ID / hàm | Bối cảnh và hợp đồng | Ví dụ | Mục tiêu |
| --- | --- | --- | --- |
| M01 longestRun | Dãy mã sự kiện; tìm độ dài đoạn liên tiếp không có mã trùng. Rỗng →0. | [1,2,2,1] →2 | n≤100000, thời gian kỳ vọng O(n) |
| M02 balancedWindows | Dòng tiền âm/dương/0; đếm đoạn liên tiếp không rỗng có tổng bằng target long. Trả long. | [1,-1,1],target1 →3 | n≤100000, kỳ vọng O(n) |
| M03 desks | Mỗi lượt khách chiếm một quầy trong [start,end), start<end; cần ít nhất bao nhiêu quầy? Đầu mút trùng có thể dùng lại quầy. Khoảng sai → IllegalArgumentException. | [[1,3],[3,5]] →1 | O(n log n) |
| M04 intakePosition | Mảng thời gian đã tăng dần, cho phép trùng; trả vị trí đầu có thời gian >cutoff, không có trả n. | [1,3,3,7],cutoff3 →3 | O(log n) |
| M05 deliverySteps | Đồ thị có hướng, mọi chặng tốn1; tìm số chặng ít nhất từ start tới destination. Không tới →-1; cùng điểm →0; ID/cạnh sai → IllegalArgumentException. | 0→1→2 và0→2: từ0 tới2 →1 | O(V+E) |
| M06 packages | Kích thước gói dương, được dùng vô hạn, có thể trùng; đạt đúng amount bằng ít gói nhất. amount0 →0; không đạt →-1; amount ngoài0..100000 hoặc size≤0 → lỗi. | [1,3,4],6 →2 | O(amount × số loại) |
| M07 loads | Cache có slots≥1; thiếu mã thì tải một lần, mọi truy cập làm mã mới dùng nhất. Đầy thì loại mã lâu nhất chưa dùng. Trả số lần tải; slots≤0 → lỗi. | [1,2,1,3,2],slots2 →4 | Kỳ vọng O(n) |
| M08 priorities | Chọn limit mã có nhiều báo cáo nhất; bằng tần suất thì mã nhỏ trước; trả đúng thứ tự. limit từ0 đến số mã khác nhau, ngoài khoảng → lỗi. | [2,2,1,1,3],limit1 →[1] | O(n+u log(max(2,limit))) kỳ vọng; u là số mã khác nhau |

Chia thành đề A (M01–M04) và B (M05–M08), mỗi đề tự đặt 90–120 phút. Đây là thời lượng gợi ý. Không dùng thời gian test nhỏ để kết luận đã đạt độ phức tạp yêu cầu.