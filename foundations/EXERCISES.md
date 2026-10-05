# Java từ cú pháp đến dữ liệu bền

Ba bài dùng JDK 17+, không dependency. Chạy `python3 scripts/check.py --track foundations --id J01`. Sửa `foundations/starter/FoundationsLab.java`; test phải đỏ trước khi hoàn thiện. Xem [lời giải](SOLUTIONS.md) sau khi thử.

## J01 — Biến, vòng lặp, mảng và phương thức

Tiên quyết: P0.2 (biên dịch và chạy main). Một biến có kiểu và giá trị; `int[]` giữ các số theo chỉ số từ 0. Phương thức gom một hợp đồng có thể gọi lại. `for (int value : values)` duyệt từng giá trị, không sửa mảng.

Viết `stats(int[])` trả record `Stats(sum, minimum, maximum)`. Null hoặc mảng rỗng phải ném IllegalArgumentException. Tổng dùng long từ phép cộng đầu tiên. Ví dụ `[-5,-3] → (-8,-5,-3)`, `[2147483647,2147483647] → (4294967294,2147483647,2147483647)`.

Cơ bản: tự trace mảng một phần tử, âm, hỗn hợp. Trung bình: giải thích vì sao khởi tạo min=0 sai với toàn số dương. Nâng cao: chứng minh sau i phần tử, sum/min/max chỉ mô tả prefix đã duyệt; giữ input không đổi. Biến thể: thêm trung bình double và kiểm tra phép chia nguyên; không nhân bản bài chỉ bằng đổi input.

Test: FoundationsChecks J01 kiểm tra overflow, âm, rỗng và null. Ví dụ chạy được nằm trong main của test; gọi lệnh bên trên để đối chiếu expected/actual.

## J02 — OOP, generics, equals/hashCode và collections

Tiên quyết: J01 và P1.2. OOP đóng gói identity và invariant của một đối tượng. `DocumentKey(owner,id)` bất biến: owner không blank, id dương. Hai khóa chỉ bằng nhau khi **cả owner lẫn id** giống nhau. Bỏ owner có thể làm lẫn dữ liệu hai người dùng.

Viết equals/hashCode cho khóa; viết `<T> List<T> distinct(List<? extends T>)` loại trùng, giữ lần xuất hiện đầu và trả snapshot không sửa được. Null list/phần tử phải ném NullPointerException. Ví dụ `(an,1),(an,1),(binh,1)` còn hai khóa.

Cơ bản: giải thích constructor/field/private. Trung bình: so `==` và `equals`, chỉ ra LinkedHashSet giữ thứ tự. Nâng cao: chứng minh equal ⇒ cùng hash, nhưng cùng hash không suy ra equal; thử sửa key sau khi thêm HashMap và giải thích tại sao thiết kế bất biến tránh lỗi đó. Biến thể: nhận key extractor để loại trùng tài liệu theo owner+id mà vẫn giữ toàn bộ payload đầu tiên.

Test J02 dùng hai đối tượng khác instance, khác owner, null và snapshot bất biến; không chỉ gọi equals trên chính nó.

## J03 — Exception và File I/O UTF-8

Tiên quyết: J02. Exception cho phép báo lỗi cho caller; không đổi lỗi đọc file thành danh sách rỗng, vì đó là hai kết quả khác nhau. Try-with-resources đóng reader cả khi đọc thất bại.

Viết `readTitles(Path)` đọc UTF-8 theo dòng, strip hai đầu, bỏ dòng trắng, giữ thứ tự và trả snapshot. File trống trả list rỗng, file thiếu ném IOException. Ví dụ `  Tiếng Việt  \n\nJava` trả `[Tiếng Việt, Java]`.

Cơ bản: chạy ví dụ với file tạm của test. Trung bình: giải thích checked exception và ai chịu trách nhiệm xử lý. Nâng cao: đọc file lớn bằng BufferedReader thay vì đọc toàn bộ bytes; lưu ý danh sách kết quả vẫn tăng theo số dòng. Biến thể: API nhận Consumer để xử lý streaming với bộ nhớ không phụ thuộc số kết quả.

Test J03 tạo/xóa file tạm, kiểm UTF-8, CRLF, file rỗng và IOException. Không dùng đường dẫn phụ thuộc máy.
