# Đáp án đối chiếu sau bài làm

| ID | Hướng | Invariant | Độ phức tạp | Ôn lại |
| --- | --- | --- | --- | --- |
| M01 | Sliding window + last index | left chỉ tăng; mọi mã trong cửa sổ khác nhau | O(n) kỳ vọng, O(u) | D04,V04,B05 |
| M02 | Prefix sum + frequency | mỗi prefix cũ bằng current-target tạo một đoạn; query trước insert | O(n) kỳ vọng, O(n) | D05,V05 |
| M03 | Sort + min heap end | heap giữ đúng các lượt đang chiếm quầy ở thời điểm start | O(n log n), O(n) | V08,D08 |
| M04 | Upper bound binary search | [0,left)≤cutoff;[right,n)>cutoff | O(log n), O(1) | D07,V07 |
| M05 | BFS | đánh dấu khi enqueue; lớp đầu tới node là khoảng cách ngắn nhất | O(V+E), O(V) | D10,V10 |
| M06 | Dynamic programming | dp[s] là ít gói nhất để đạt đúng s; greedy sai với1,3,4 và6 | O(amount×m), O(amount) | D11 |
| M07 | Access-order map | thứ tự chứa các mã từ lâu chưa dùng nhất tới mới nhất | O(n) kỳ vọng, O(slots) | D12,V12 |
| M08 | Frequency map + heap | heap giữ k mã tốt nhất; phần tử tệ nhất ở đầu; phá hòa nhất quán | O(n+u log(max(2,k))) kỳ vọng, O(u+k) | D01,V09 |

Mã đầy đủ: [MixedLab.java](solution/MixedLab.java). Không chỉ đối chiếu output: giải thích phản ví dụ mà cách đơn giản xử lý sai hoặc quá chậm.