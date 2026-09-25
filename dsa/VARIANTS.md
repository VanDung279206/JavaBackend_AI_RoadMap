# 15 bài DSA và 12 biến thể chuyển giao

Làm D01–D12 trong `EXERCISES.md` trước. Ba bài mới D13–D15 và các biến thể dùng `practice/starter/MoreDsa.java`. Null nằm ngoài hợp đồng trừ head/root có thể null. Các bài chuỗi dùng ASCII; không mặc định `char` là một ký tự người dùng nhìn thấy trong mọi ngôn ngữ.

```bash
python3 scripts/check.py --id D13
python3 scripts/check.py --id V04
```

| ID | Nhiệm vụ và ví dụ | Gợi ý trước khi xem lời giải | Đổi điều kiện so với bài gốc |
| --- | --- | --- | --- |
| D13 | Đảo linked list 1→2→3 thành 3→2→1; null→null | Lưu next trước khi đổi liên kết | Tái sử dụng node, không tạo node mới; input không có chu trình |
| D14 | Độ sâu cây; root null→0, root có một con→2 | Stack chứa node và depth | Dùng DFS lặp để xử lý cây lệch sâu; tính theo số node |
| D15 | Graph có hướng: 0→1→2→0 là cycle; 0→1,0→2,1→2 không cycle | Phân biệt đang ở đường DFS với đã duyệt xong | Duyệt cả thành phần rời; self-loop là cycle; sai endpoint phải ném lỗi |
| V01 | `[4,1,4,2,1]` → first unique=2; không có → OptionalInt.empty | Đếm rồi đọc lại theo thứ tự input | D01: thứ tự lựa chọn không phải thứ tự HashMap |
| V02 | `[3,3,3]`,target=6 → 3 cặp chỉ số i<j | Map lưu số lần xuất hiện | D02: đếm mọi cặp, trả long; không ghép phần tử với chính nó |
| V03 | `A man, a plan, a canal: Panama!` → true; `0P` → false | Chuẩn hóa ASCII chữ/số rồi hai con trỏ | D03: bỏ dấu câu, không phân biệt hoa/thường; sau lọc rỗng→true |
| V04 | `eceba`,k=2 → 3; `abc`,k=0 → 0 | Map tần suất; co trái khi quá k loại | D04: cho phép lặp, giới hạn số loại; k<0 ném lỗi |
| V05 | `[1,-1,0]`,sum=0 → 3 đoạn con | Prefix sum + tần suất prefix trước | D05: cần đếm, có số âm; sliding window thông thường không đủ |
| V06 | `()))((` → cần thêm 4 dấu | Theo dõi ngoặc mở chưa khớp và ngoặc đóng thiếu cặp | D06: chỉ `()`; ký tự khác ném lỗi |
| V07 | `[1,3,3,7]`,target=3 → 3 | Tìm vị trí đầu tiên > target | D07: upper bound thay lower bound; input tăng dần |
| V08 | `[0,30),[5,10),[15,20)` → 2 phòng | Heap thời điểm kết thúc | D08: khoảng nửa mở; chạm đầu mút được dùng lại phòng; start<end |
| V09 | `[2,2,1,1,3]`,k=2 → `[1,2]` | Map tần suất + heap giữ k phần tử tốt nhất | D09: xếp theo tần suất; hòa thì số nhỏ trước; 0<=k<=số giá trị khác nhau |
| V10 | 0→1,2;1→3;2→3: đường 0 tới 3 → `[0,1,3]` | BFS lưu parent khi enqueue | D10: dựng đường; tie theo thứ tự neighbor; không có đường→[] |
| V11 | coins=[1,2],amount=4 → 3 cách: 1111,112,22 | Đặt vòng coin ngoài, sum trong | D11: đếm tổ hợp không kể thứ tự; coin dương, không trùng; amount 0..100000 |
| V12 | requests=[1,2,1,3,2],capacity=2 → 4 misses | Cache giữ thứ tự lần truy cập gần nhất | D12: mỗi miss nạp key; mỗi hit cập nhật recency; capacity>=1 |

V11 dùng `Math.addExact`; vượt long phải ném ArithmeticException thay vì âm thầm sai số.

## Quy trình ôn một pattern

1. Giải bài gốc, ghi invariant bằng một câu.
2. Đóng mã; vẽ bảng biến với một input biên.
3. Làm biến thể bằng file starter, không chỉ đổi tên biến.
4. Giải thích điều kiện nào khiến lời giải cũ không còn đủ.
5. Ghi ngày, mức hỗ trợ đã dùng và bằng chứng trong `progress/MASTERY.md`.

Chỉ khi đã tự thử mới mở [lời giải biến thể](VARIANT_SOLUTIONS.md). Các mốc ôn trong repo là lịch thực hành gợi ý, không phải cam kết ghi nhớ.