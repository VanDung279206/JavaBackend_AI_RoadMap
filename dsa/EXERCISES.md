# 12 bài DSA cho Java Backend
DSA = Data Structures and Algorithms: cấu trúc dữ liệu và thuật toán. Đây là bộ chọn lọc để luyện cách giải thích, phân tích chi phí và nhận diện dạng bài. Mỗi bài có mã hoàn chỉnh trong `labs/src/DsaSolutions.java`, diễn giải tại [SOLUTIONS.md](SOLUTIONS.md).

Với mỗi bài: viết cách đơn giản trước → chạy ví dụ → tìm thao tác lặp tốn kém → chọn cấu trúc dữ liệu → nêu invariant → kiểm tra biên. Các input null nằm ngoài hợp đồng trừ khi đề nói khác. Các bài chuỗi dùng ASCII; không xem `char` là ký tự hiển thị Unicode tổng quát.

## D01 — Đếm tần suất · Cơ bản
Nhận mảng số nguyên, trả map số → số lần xuất hiện. `[2,1,2]` → `{1:1,2:2}`; `[]` → `{}`. Không yêu cầu thứ tự map. Gợi ý: mỗi giá trị là một khóa. Liên hệ: thống kê mã trạng thái hoặc lượt gọi endpoint.

## D02 — Two Sum · Cơ bản
Trả hai chỉ số khác nhau có tổng bằng target; không có thì trả mảng rỗng. `[3,3]`, target=6 → `[0,1]`; `[3]`, target=6 → `[]`. Khi có nhiều đáp án, chấp nhận bất kỳ cặp đúng. Target dùng `long`. Gợi ý: phần còn thiếu đã xuất hiện chưa?

## D03 — Palindrome bằng hai con trỏ · Cơ bản
Kiểm tra chuỗi đọc xuôi/ngược giống nhau, phân biệt hoa/thường, không bỏ dấu cách. `racecar` → true, `ab` → false, chuỗi rỗng → true. Gợi ý: so hai đầu và tiến vào giữa. Liên hệ: luyện xử lý chuỗi với bộ nhớ phụ nhỏ.

## D04 — Đoạn con dài nhất không lặp · Trung bình
Trả độ dài substring không có ký tự lặp. `abcabcbb` → 3; `abba` → 2; chuỗi rỗng → 0. Gợi ý: cửa sổ `[left,right]` và vị trí gặp gần nhất. Giải thích tại sao left không được lùi.

## D05 — Prefix sum · Cơ bản
Tiền xử lý mảng để trả tổng đoạn chỉ số đóng `[left,right]`. `[2,4,1,3]`, query `[1,3]` → 8. Dùng `long` cho tổng; từ chối khoảng truy vấn sai. Gợi ý: prefix có n+1 phần tử và phần tử đầu bằng 0. Liên hệ: tổng request theo đoạn thời gian trên dữ liệu cố định.

## D06 — Dấu ngoặc hợp lệ · Cơ bản
Chỉ nhận ký tự `()[]{}`. `([]{})` → true; `([)]` → false; `]` → false; chuỗi rỗng → true; ký tự khác → false. Gợi ý: dấu mở sau cùng phải được đóng trước. Đây không phải parser đầy đủ cho JSON hoặc Java.

## D07 — Lower bound · Trung bình
Mảng đã sắp tăng dần. Trả vị trí đầu tiên có giá trị >= target, hoặc n nếu không có. `[1,3,3,7]`, target=3 → 1; target=8 → 4; mảng rỗng → 0. Gợi ý: khoảng tìm kiếm nửa mở `[left,right)`. Liên hệ: tìm điểm bắt đầu trong dãy timestamp đã sắp.

## D08 — Gộp khoảng · Trung bình
Input là các khoảng đóng `[start,end]`, start<=end. Khoảng chạm đầu mút được gộp. `[[5,7],[1,3],[3,4]]` → `[[1,4],[5,7]]`. Không sửa input. Mảng rỗng → mảng rỗng. Gợi ý: sắp theo start trước.

## D09 — Top-k bằng heap · Trung bình
Trả k số lớn nhất theo thứ tự giảm dần, giữ giá trị trùng. `[4,1,9,9,2]`, k=3 → `[9,9,4]`. Cho phép k=0; từ chối k<0 hoặc k>n. Gợi ý: giữ min-heap tối đa k phần tử. Liên hệ: chọn các điểm số cao trong bộ nhớ; vector database có thuật toán truy xuất riêng.

## D10 — BFS đường đi ngắn nhất · Trung bình
Graph không trọng số, biểu diễn adjacency list; ID đỉnh từ 0 đến n-1. Với cạnh hai chiều 0–1, 0–2, 1–3 và đỉnh 4 cô lập: distance(0,3)=2; distance(0,4)=-1; distance(0,0)=0. Gợi ý: đánh dấu đã thăm lúc đưa vào queue.

## D11 — Coin change bằng DP · Trung bình
Có vô hạn đồng mỗi mệnh giá dương. Tìm số đồng ít nhất tạo amount; không tạo được trả -1. `[1,3,4]`, amount=6 → 2; `[2]`, amount=3 → -1; amount=0 → 0. Hợp đồng lab giới hạn amount từ 0 đến 100000 để giới hạn bộ nhớ. Gợi ý: lời giải cho tổng s dùng kết quả của s-coin. Thử chỉ ra vì sao greedy lấy đồng lớn nhất sai với ví dụ đầu.

## D12 — LRU cache · Trung bình
Cache có capacity>0, không nhận key/value null. `get` và cập nhật key đã có đều làm key đó thành mới dùng nhất. Capacity=2: put(1,A), put(2,B), get(1), put(3,C) → key 2 bị loại. Key không có trả null. Bài một luồng; không có TTL. Gợi ý: hash map kết hợp thứ tự truy cập.

## Điều kiện tự đánh giá
- [ ] Viết lại được lời giải mà không nhìn mã.
- [ ] Nêu được hợp đồng input, độ phức tạp và một lỗi biên.
- [ ] Giải thích được invariant thay vì chỉ thuộc template.
- [ ] Làm lại với dữ liệu khác và một biến thể nhỏ.

## Sau 12 bài gốc
Làm tiếp [D13–D15 và V01–V12](VARIANTS.md) trong starter. Mỗi pattern có một biến thể để kiểm tra khả năng áp dụng.