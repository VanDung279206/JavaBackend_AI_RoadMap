# Lời giải biến thể và invariant

Mã đầy đủ: [MoreDsa.java](../practice/solution/MoreDsa.java). Chạy `python3 scripts/check.py --mode solution --id V04` từ gốc repo.

Trong bảng, n là số phần tử/ký tự, u là số giá trị khác nhau, h là độ sâu cây, V/E là số đỉnh/cạnh, A là amount, C là số loại coin. Độ phức tạp HashMap/LinkedHashMap là kỳ vọng theo các thao tác băm thông thường. Không tính bộ nhớ output nếu đã nói rõ.

| ID | Lập luận lời giải | Thời gian / bộ nhớ phụ | Lỗi cần tự kiểm tra |
| --- | --- | --- | --- |
| D13 | previous là đầu phần đã đảo; head là phần chưa xử lý; lưu next rồi đổi head.next | O(n) / O(1) | Quên lưu next mất phần còn lại; tail mới phải trỏ null |
| D14 | Mỗi frame mang độ sâu chính xác của node; cập nhật max rồi đẩy con depth+1 | O(n) / O(h) với DFS trên cây nhị phân | Nhầm số cạnh và số node; gọi đệ quy với cây rất sâu |
| D15 | Trắng=chưa vào, xám=trên stack DFS, đen=đã xong; cạnh tới xám tạo cycle | O(V+E) / O(V) | Cạnh tới đen trong DAG không phải cycle; nhớ thành phần rời |
| V01 | Counts hoàn chỉnh trước khi chọn; lượt hai giữ thứ tự gốc | O(n) / O(u) | Lấy phần tử đầu HashMap |
| V02 | Trước khi thêm x, counts chỉ chứa chỉ số trước hiện tại; cộng counts[target−x] | O(n) / O(u) | Tăng counts trước sẽ đếm tự ghép; dùng long |
| V03 | Chuẩn hóa một lần rồi so sánh cặp đối xứng | O(n) / O(n) do chuỗi chuẩn hóa | Bỏ cả chữ số; nhầm hỗ trợ Unicode tổng quát |
| V04 | Sau vòng while, cửa sổ có không quá k loại; mỗi đầu chỉ tiến | O(n) / O(min(n,số ký tự)) | Giữ key có count=0 làm size sai |
| V05 | Prefix hiện tại−prefix cũ=target; map lưu số prefix cũ | O(n) / O(n) | Quên prefix rỗng=0 xuất hiện 1 lần; không hỗ trợ số âm |
| V06 | opens đếm '(' chưa khớp; đóng khi opens=0 phải thêm một '(' | O(n) / O(1) | Chỉ lấy trị tuyệt đối số mở−đóng sẽ bỏ lỗi thứ tự |
| V07 | Khoảng [l,r) còn chứa đáp án; khi a[mid]<=target bỏ cả mid | O(log n) / O(1) | Điều kiện >= cho lower bound không đúng ở đây |
| V08 | Trước khi thêm meeting, bỏ mọi phòng đã rảnh; heap chứa thời điểm kết thúc các meeting đang chồng nhau | O(n log n) / O(n) | Nửa mở khác khoảng đóng của D08; giải phóng với <= |
| V09 | Heap root là phần tử tệ nhất trong nhóm đang giữ; bỏ root khi vượt k | O(n+u log k+k log k) / O(u+k), k>=1 | Comparator hòa điểm phải bỏ số lớn; k=0 trả ngay |
| V10 | Parent gán một lần tại enqueue; chuỗi parent dẫn về start | O(V+E) / O(V) | Đánh dấu khi dequeue gây enqueue lặp; đảo đường sau dựng |
| V11 | Sau mỗi coin, dp[s] chỉ dùng các coin đã xét; không sinh thêm hoán vị | O(CA) / O(A) | Đổi thứ tự vòng sẽ đếm permutations; coin trùng đếm thừa |
| V12 | LinkedHashMap accessOrder=true; hit get() đưa key về mới dùng nhất; miss nạp và bỏ key đầu nếu đầy | O(n) kỳ vọng / O(capacity) | Dùng insertion order khiến hit không cập nhật recency |

Khi k=0 ở V09, thuật toán vẫn đã đếm tần suất để kiểm tra hợp đồng, thời gian O(n) và bộ nhớ O(u).

Ví dụ tự trình bày V04: “The window contains at most k distinct characters after the inner loop. I move the left pointer until the constraint is restored. Each pointer moves forward, so the running time is linear.”