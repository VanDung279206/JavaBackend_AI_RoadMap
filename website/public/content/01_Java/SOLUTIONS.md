# Lời giải Phase 1

Mã đầy đủ: [JavaCoreLab.java](../../labs/src/JavaCoreLab.java). Cách chạy: [labs/README.md](../../labs/README.md).

## P1.1

Thứ tự xử lý: kiểm tra null → `strip()` → `replaceAll("\\s+", " ")` → từ chối kết quả rỗng. Trong lời giải, `\s` ở giữa chuỗi dùng phạm vi mặc định của Java regex; hợp đồng bài giới hạn khoảng trắng ASCII để tránh ngầm hứa hỗ trợ mọi loại khoảng trắng Unicode.

`raw == ""` so sánh tham chiếu. Kiểm tra nội dung rỗng bằng `isEmpty()`; kiểm tra toàn khoảng trắng bằng `isBlank()` khi phù hợp. Lỗi thường gặp: gọi `strip()` trước khi kiểm tra null; vô tình chuyển cả tiêu đề sang chữ thường.

Tự ôn: viết lại mà không nhìn mã; thêm input chỉ gồm tab.

## P1.2

`record Document` gom dữ liệu và đặt kiểm tra ở constructor. `LinkedHashMap<Long, Document>` ánh xạ ID → tài liệu và giữ thứ tự thêm. `putIfAbsent` giúp phát hiện ID đã có; không dùng `put` rồi mới báo lỗi vì dữ liệu cũ có thể đã bị ghi đè.

`Optional.ofNullable` biểu diễn có/không có kết quả. `List.copyOf` tách cấu trúc danh sách trả về; các phần tử của bài là record chứa giá trị và chuỗi bất biến. Với đối tượng chứa trường mutable, bản sao danh sách chưa phải bản sao sâu.

`find`, `add`, `remove` dùng thao tác hash map có chi phí kỳ vọng hằng số khi phân bố hash phù hợp; sao chép toàn bộ danh sách là O(n). Bài dành cho một luồng; chưa dùng map này làm kho lưu trữ dùng chung cho request đồng thời.

## P1.3

Mỗi token cập nhật `counts.merge(word, 1, Integer::sum)`. Dùng `TreeMap` vì đề yêu cầu thứ tự từ; với n token, u từ khác nhau, thao tác cây có chi phí O(n log u), chưa tính chi phí xử lý/so sánh chuỗi. Nếu dùng `HashMap`, cần sắp xếp riêng khi hiển thị.

Kết quả của `"Java java AI"` là `{ai=1, java=2}`. Quy tắc tách từ là một phần hợp đồng: `java,` khác `java`. Với dữ liệu ngôn ngữ tự nhiên thật, cần chọn tokenizer phù hợp với mục tiêu.

## P1.4

Chuẩn hóa keyword trước, sau đó lọc `title.toLowerCase(Locale.ROOT).contains(key)`, sắp theo ID và thu về danh sách không sửa được. Lọc trước giúp chỉ sắp các kết quả phù hợp. Với n tài liệu và m kết quả, có n lần kiểm tra tiêu đề và chi phí sắp O(m log m); thời gian tìm chuỗi còn phụ thuộc độ dài tiêu đề/keyword.

Kết quả `[1,3]` có thứ tự xác định. Trả danh sách rỗng khi không khớp; keyword rỗng bị từ chối vì hợp đồng đã chọn như vậy.

Nguồn nền tảng: [Java Collections](https://dev.java/learn/api/collections-framework/), [HashMap](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/HashMap.html).