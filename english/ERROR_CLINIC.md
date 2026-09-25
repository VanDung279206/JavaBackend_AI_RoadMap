# Tiếng Anh qua thông báo lỗi thực chạy

Tám thông báo dưới đây được thu khi chạy **fixture cố ý gây lỗi** bằng JDK trong môi trường soạn repo; không phải log lỗi trên máy của bạn. [Bản ghi đầy đủ](observed-errors.json) có exit code và stack trace; đường dẫn tạm đã được thay bằng `<temporary-directory>`. Câu chữ/line number có thể khác giữa phiên bản JDK.

```bash
python3 scripts/error_examples.py E01
python3 scripts/error_examples.py --verify
```

Lệnh đầu cố ý trả mã khác0 để xem lỗi. `--verify` chỉ kiểm tra fixture phát đúng diagnostic, không chứng nhận code sai đã được sửa. Sao chép fixture ra thư mục học trước khi thử sửa; các mẫu dưới đây mô tả lỗi/hướng sửa, không tuyên bố đã triển khai fix trong fixture.

Quy trình: đọc loại lỗi → tìm dòng đầu thuộc code của mình → tái hiện input → giải thích nguyên nhân → sửa theo hợp đồng → chạy lại test → viết 2–3 câu về bằng chứng.

## E01

```text
Exception in thread "main" java.lang.NullPointerException: Cannot invoke "String.length()" because "<local3>" is null
```

| Mục | Nội dung |
| --- | --- |
| Nghĩa trong fixture | Đang gọi length trên tham chiếu null. |
| Chẩn đoán và cách xử lý | Xác định biến null và hợp đồng: từ chối title thiếu trước khi dùng, không tự đổi null thành dữ liệu hợp lệ. |
| Mô tả bằng tiếng Anh | The title is null. Validate the input before reading its length. |
| Bài liên quan | P1.1 |
| Tự giải thích | Nếu title chỉ là khoảng trắng, thêm kiểm tra nào? |

## E02

```text
Exception in thread "main" java.lang.ArrayIndexOutOfBoundsException: Index 3 out of bounds for length 3
```

| Mục | Nội dung |
| --- | --- |
| Nghĩa trong fixture | Chỉ số 3 vượt giới hạn của mảng dài 3. |
| Chẩn đoán và cách xử lý | Chỉ số hợp lệ là0..2; kiểm tra biên vòng lặp và không bỏ mất phần tử cuối. |
| Mô tả bằng tiếng Anh | The loop accesses index three, but the last valid index is two. |
| Bài liên quan | D05,V07 |
| Tự giải thích | Viết trace cho mảng rỗng và một phần tử. |

## E03

```text
Exception in thread "main" java.lang.NumberFormatException: For input string: "12x"
```

| Mục | Nội dung |
| --- | --- |
| Nghĩa trong fixture | Chuỗi 12x không biểu diễn số nguyên hợp lệ. |
| Chẩn đoán và cách xử lý | Xác định input cần cho phép gì; validate/parse và trả lỗi nhập liệu rõ ràng, không mặc định biến thành0. |
| Mô tả bằng tiếng Anh | The input contains a non-numeric character. Reject it with a clear validation message. |
| Bài liên quan | P1.1 |
| Tự giải thích | Khi nào dấu trừ hoặc khoảng trắng được phép? Nêu hợp đồng. |

## E04

```text
Exception in thread "main" java.lang.IllegalArgumentException: duplicate id
```

| Mục | Nội dung |
| --- | --- |
| Nghĩa trong fixture | ID đã tồn tại. |
| Chẩn đoán và cách xử lý | Đây là từ chối có chủ ý của Catalog; không xóa kiểm tra trùng. Xác minh bản ghi First còn nguyên và sửa ID/input ở caller nếu cần thêm tài liệu mới. |
| Mô tả bằng tiếng Anh | The identifier already exists. Keep the original document and reject the duplicate. |
| Bài liên quan | P1.2,B01 |
| Tự giải thích | Nếu thay putIfAbsent bằng put thì lỗi dữ liệu nào xuất hiện? |

## E05

```text
Exception in thread "main" java.lang.UnsupportedOperationException: TODO P1.1
```

| Mục | Nội dung |
| --- | --- |
| Nghĩa trong fixture | Nhánh P1.1 chưa được triển khai. |
| Chẩn đoán và cách xử lý | Mã starter cố ý ném lỗi. Viết normalizeTitle theo hợp đồng; không chỉ xóa throw rồi trả giá trị cố định. |
| Mô tả bằng tiếng Anh | The method is not implemented yet. Complete the required behavior and rerun its tests. |
| Bài liên quan | P1.1 |
| Tự giải thích | Dùng test nào chứng minh không hard-code một output? |

## E06

```text
Exception in thread "main" java.lang.AssertionError: expected=3 actual=2
```

| Mục | Nội dung |
| --- | --- |
| Nghĩa trong fixture | Giá trị kỳ vọng là3 nhưng thực nhận là2. |
| Chẩn đoán và cách xử lý | Đọc đề và input trước khi sửa; expected cũng có thể sai trong test thật. Fixture này cố ý đặt hai số khác nhau để học cách đọc assertion. |
| Mô tả bằng tiếng Anh | The expected value is three, while the actual value is two. Check the input and the contract before changing the code. |
| Bài liên quan | D05,P6.4 |
| Tự giải thích | Nêu một lỗi biên có thể làm thiếu đúng một phần tử. |

## E07

```text
Exception in thread "main" java.util.concurrent.TimeoutException
```

| Mục | Nội dung |
| --- | --- |
| Nghĩa trong fixture | Tác vụ không hoàn tất trong thời gian chờ. |
| Chẩn đoán và cách xử lý | Fixture chờ latch không mở. Phân biệt timeout với failure trả về; hủy hợp tác và cấu hình deadline, không tăng thời gian vô hạn. |
| Mô tả bằng tiếng Anh | The task did not finish before the deadline. Cancel the pending work and report the timeout. |
| Bài liên quan | C03,P5.4 |
| Tự giải thích | Giải thích vì sao cancel(true) không bảo đảm ngừng mọi tác vụ. |

## E08

```text
<temporary-directory>/MissingSymbol.java:2: error: cannot find symbol
```

| Mục | Nội dung |
| --- | --- |
| Nghĩa trong fixture | Compiler không tìm được biến missingValue. |
| Chẩn đoán và cách xử lý | Kiểm tra tên, khai báo và phạm vi biến. Khai báo đúng kiểu/giá trị hoặc sửa tên dùng sai rồi biên dịch lại. |
| Mô tả bằng tiếng Anh | The compiler cannot resolve the variable. Check its declaration, spelling, and scope. |
| Bài liên quan | P0.2 |
| Tự giải thích | Biến khai báo trong một block có dùng ở ngoài block đó không? |

## Phân biệt các từ thường gặp

| Từ | Ý nghĩa trong debug | Câu ngắn |
| --- | --- | --- |
| expected | Điều hợp đồng/test yêu cầu | The expected count is three. |
| actual | Điều chương trình trả thực tế | The actual count is two. |
| cause | Nguyên nhân | The cause is an incorrect boundary. |
| fix | Thay đổi để sửa nguyên nhân | The fix corrects the loop condition. |
| verify | Kiểm tra lại bằng bằng chứng | Verify the result with an edge case. |

Mẹo nhớ: **mong đợi → thực tế → nguyên nhân → sửa → kiểm lại**. Một câu dùng cả năm: “Compare the expected and actual values, identify the cause, apply the fix, and verify the result.”

Các câu mẫu có văn phong trung tính/kỹ thuật. Các từ expected, actual, cause, verify có thể dùng trong IELTS Task 2 khi đúng ngữ cảnh; trong văn nghị luận trang trọng, dùng solution/corrective measure thay fix khi nói về biện pháp. Đoạn kể debug không tự động phù hợp mọi đề IELTS.

## Mẫu báo lỗi có bằng chứng

- Input: …
- Expected: …
- Actual: …
- Cause: …
- Change made: …
- Verification: command, exit code, test case …

Chỉ viết “The test passed” sau khi chạy test thực sự. Nếu mới đề xuất, viết “This change should …; verification is pending.” Không chép nguyên mật khẩu/token hoặc dữ liệu riêng vào báo lỗi.