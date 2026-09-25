# Lời giải và cách ghi nhớ DSA

Mã hoàn chỉnh của cả 12 bài: [DsaSolutions.java](../labs/src/DsaSolutions.java). Kiểm tra chạy được: [LabChecks.java](../labs/src/LabChecks.java). Các phân tích dưới đây tính thao tác số nguyên/ký tự là O(1); hash map dùng giả định phân bố hash phù hợp. Không coi mọi thao tác map là O(1) trong mọi trường hợp.

## D01 — Frequency map

Mỗi phần tử v thực hiện `map.merge(v,1,Integer::sum)`. Sau khi duyệt i phần tử, map chứa đúng tần suất của prefix đã duyệt: đó là invariant. `[2,1,2]`: `{2:1}` → `{2:1,1:1}` → `{2:2,1:1}`.

Thời gian kỳ vọng O(n), bộ nhớ O(u) với u giá trị khác nhau. Mẹo nhớ: “một khóa, một bộ đếm”. Lỗi thường gặp: dùng `Set`, khiến mất tần suất; hoặc dùng map nhưng mặc định nó có thứ tự sắp xếp.

## D02 — Two Sum

Với phần tử x ở i, tìm `target-x` trong các phần tử đã duyệt. Nếu có chỉ số j, trả j,i. Sau đó mới lưu x nếu chưa có. Trật tự này bảo đảm không dùng một phần tử hai lần.

`[3,3]`: i=0 chưa có 3 nên lưu; i=1 thấy 3 ở chỉ số 0 → `[0,1]`. Thời gian kỳ vọng O(n), bộ nhớ O(n). Phép tính dùng long để tổng của hai int lớn không bị tràn int. Mẹo: “tìm bạn trước, ghi mình sau”.

## D03 — Hai con trỏ

So `text[left]` với `text[right]`; khác thì false, giống thì tăng left và giảm right. Invariant: những cặp đã đi qua đều bằng nhau. Khi hai con trỏ gặp/vượt nhau, không còn cặp chưa kiểm tra.

O(n) thời gian, O(1) bộ nhớ phụ. Lỗi thường gặp: tự chuyển lowercase hoặc bỏ khoảng trắng làm đổi hợp đồng đề. Biến thể ôn: nếu đề yêu cầu bỏ ký tự ngoài chữ/số, phần chuẩn hóa phải được bổ sung rõ ràng.

## D04 — Sliding window

`last[c]` lưu vị trí c gần nhất. Gặp c ở right thì cập nhật `left=max(left,last[c]+1)`, rồi tính độ dài `right-left+1`. Invariant: cửa sổ hiện tại không có ký tự lặp.

Với `abba`, khi gặp b thứ hai, left=2. Khi gặp a cuối cùng, vị trí a cũ=0; left phải giữ 2. Gán thẳng left=1 sẽ kéo cửa sổ lùi và tạo lời giải sai.

O(n) thời gian kỳ vọng, O(min(n,A)) bộ nhớ với A là số ký tự phân biệt có thể gặp. Mẹo: “right mở rộng, left chỉ tiến”. Tự ôn bằng `pwwkew` → 3.

## D05 — Prefix sum

Đặt p[0]=0; p[i+1]=p[i]+a[i]. Tổng `[l,r]` bằng `p[r+1]-p[l]`. Ví dụ `[2,4,1,3]` tạo `[0,2,6,7,10]`; query `[1,3]` → 10-2=8.

Tiền xử lý O(n), mỗi query O(1), lưu O(n). Sử dụng long. Mẹo: “cộng đến sau r, trừ trước l”. Nếu dữ liệu cập nhật thường xuyên, prefix tĩnh có thể cần tính lại; đó là lúc nghiên cứu cấu trúc khác theo yêu cầu.

## D06 — Stack

Gặp dấu mở thì đẩy dấu đóng tương ứng lên stack. Gặp dấu đóng: stack phải không rỗng và phần tử đỉnh phải khớp. Kết thúc yêu cầu stack rỗng.

`([)]` thất bại khi gặp `)` vì đỉnh đang cần `]`. O(n) thời gian, O(n) bộ nhớ tệ nhất. Mẹo: “mở sau, đóng trước”. Chỉ đếm số dấu mở/đóng sẽ bỏ sót lỗi thứ tự.

## D07 — Binary search lower bound

Khởi tạo left=0,right=n. Invariant: mọi chỉ số <left có giá trị <target; mọi chỉ số >=right có giá trị >=target. mid=left+(right-left)/2. Nếu a[mid]<target thì left=mid+1; ngược lại right=mid.

Khi left=right, đó là điểm phân chia cần tìm. O(log n) thời gian, O(1) bộ nhớ. Điều kiện input đã sắp tăng dần là bắt buộc; hàm lab không tự sắp hoặc quét kiểm tra vì việc đó thay đổi chi phí. Mẹo: “tìm biên, không chỉ tìm một phần tử bằng”.

## D08 — Merge intervals

Sao chép rồi sắp các khoảng theo start. Giữ kết quả đã gộp: nếu start mới > end cuối thì thêm khoảng mới; ngược lại kéo end cuối đến max của hai end.

`[1,3]` và `[3,4]` gộp thành `[1,4]` vì bài dùng khoảng đóng. O(n log n) thời gian; O(n) bộ nhớ bao gồm bản sao và kết quả. Lỗi thường gặp: dùng so sánh của khoảng nửa mở trong bài khoảng đóng, hoặc sửa input khi chưa được phép.

## D09 — Min-heap cho top-k

Đưa mỗi giá trị vào heap; nếu heap có hơn k phần tử, bỏ giá trị nhỏ nhất. Invariant: heap giữ k giá trị lớn nhất đã gặp, hoặc toàn bộ nếu chưa đủ k. Cuối cùng sắp k giá trị giảm dần để đúng hợp đồng output.

Với k>=1, thời gian O(n log(k+1) + k log k), bộ nhớ O(k); với k=0 trả ngay. Không dùng phép trừ trong comparator số nguyên vì có thể tràn; lời giải dùng comparator thư viện. Mẹo: “giữ lớn nhất, bỏ nhỏ nhất”.

## D10 — BFS

Queue duyệt theo lớp khoảng cách. Đặt dist[start]=0. Khi gặp đỉnh chưa thăm next, đặt dist[next]=dist[current]+1 rồi đưa vào cuối queue. Với graph không trọng số, lần đầu phát hiện đỉnh đã cho số cạnh nhỏ nhất.

O(V+E) thời gian và O(V) bộ nhớ phụ trên adjacency list. Đánh dấu khi enqueue để tránh thêm lặp nhiều lần. BFS này không giải đường đi ngắn nhất có trọng số tùy ý. Mẹo: “đi hết lớp gần trước lớp xa”.

## D11 — Dynamic programming

dp[s] là số đồng ít nhất tạo tổng s. dp[0]=0; các tổng khác khởi tạo giá trị chưa đạt. Với mỗi coin<=s, cập nhật min(dp[s],dp[s-coin]+1). Nếu dp[amount] vẫn lớn hơn amount, trả -1.

`[1,3,4]`, amount=6: 3+3 dùng 2 đồng; greedy 4+1+1 dùng 3, nên greedy không đúng cho mọi hệ mệnh giá. O(amount × số mệnh giá) thời gian, O(amount) bộ nhớ. Mẹo: “định nghĩa trạng thái trước, viết chuyển trạng thái sau”.

## D12 — LRU

Lời giải dùng `LinkedHashMap` với accessOrder=true. `get` và `put` cập nhật thứ tự truy cập; `removeEldestEntry` loại phần tử đầu khi size>capacity. Trình tự đề bài làm key 1 mới dùng hơn key 2, nên thêm key 3 sẽ loại 2.

get/put có chi phí kỳ vọng O(1) dưới giả định hash phù hợp; bộ nhớ O(capacity). Đây là cache một luồng, không có TTL. Biến thể nâng cao: tự cài hash map + doubly linked list rồi kiểm tra với cùng chuỗi thao tác.

Nguồn API: [HashMap](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/HashMap.html), [PriorityQueue](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/PriorityQueue.html), [LinkedHashMap](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/LinkedHashMap.html).