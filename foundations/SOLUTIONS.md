# Giải thích Java nền tảng

Mã chạy được: [FoundationsLab.java](solution/FoundationsLab.java). Chạy tham chiếu: `python3 scripts/check.py --track foundations --mode solution`. Lệnh này không ghi tiến độ.

## J01 — Bất biến vòng lặp

Khởi tạo min/max từ phần tử đầu để không áp đặt giả định dấu. Dùng long sum ngay từ đầu; ép `(long)(a+b)` sau phép cộng int vẫn quá muộn. Mỗi lượt gộp đúng một giá trị vào cả ba thống kê nên invariant được giữ. Thời gian O(n), bộ nhớ O(1), không đổi mảng.

## J02 — Identity thuộc chủ sở hữu

equals kiểm tra kiểu rồi so owner và id; hashCode dùng đúng hai trường. LinkedHashSet giữ thứ tự gặp đầu tiên, List.copyOf đóng đường sửa kết quả. Immutable fields tránh thay đổi hash khi key đang trong tập. Generic T cho phép dùng cùng hợp đồng với nhiều kiểu; không ép kiểu unsafe. Chi phí kỳ vọng O(n), bộ nhớ O(n).

## J03 — Phân biệt rỗng và lỗi

Files.newBufferedReader với UTF-8 cho kết quả độc lập charset của máy. Try-with-resources giữ nguyên IOException và đóng tài nguyên. strip thực hiện chuẩn hóa mỗi dòng, điều kiện isEmpty loại dòng trắng. Không catch rồi trả empty: caller cần biết file thiếu khác file rỗng để quyết định retry hoặc báo lỗi.

Tham khảo đúng Java 17: [Object.equals/hashCode](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/lang/Object.html), [Files](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/nio/file/Files.html).
