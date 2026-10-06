# Java thí điểm: 20 bài nối mức

6 bài đọc hiểu/có hướng dẫn, 6 tự triển khai, 4 kết hợp, 2 debug và 2 thử thách. JP01–JP18 bắt buộc; JP19–JP20 mở rộng sau đủ tiên quyết. Chưa mở rộng số lượng sang chặng khác trước khi thử với người mới.

Chạy từ gốc repo: `py scripts/check.py --track java-pilot --id JP01`. Sửa [starter](starter/PilotLab.java); [lời giải](SOLUTIONS.md) chỉ mở sau khi thử. Java 17+, không dependency. Test dùng Doc hợp lệ/non-null trừ các ca validation ghi rõ.


## JP01 — Trace vòng lặp

**Kỹ năng:** Biến, vòng lặp, phép chia nguyên. **Tiên quyết:** P0.2.

**Mức:** 1. Đọc hiểu. **Phạm vi:** Bắt buộc.

**Hợp đồng và ví dụ đầu vào/đầu ra:** Điền trace() sau khi tự lập bảng n và total cho: int total=0; for(int n:new int[]{2,4,6}) total+=n/2;. Đầu ra 6; total qua từng vòng là 1, 3, 6.

**Tiêu chí hoàn thành:** tự viết hoặc sửa phương thức, giữ đúng hợp đồng và ca lỗi; chạy `py scripts/check.py --track java-pilot --id JP01`; ghi input, expected/actual và giải thích ít nhất một ca biên. Với bài đọc hiểu, lưu dự đoán trước khi chạy; debug lưu lỗi trước/sau; thử thách giải thích lựa chọn thiết kế. Test đạt mà không giải thích được thì quay lại bài học.

**Kiểm tra:** [PilotChecks](tests/PilotChecks.java) có ca bình thường, biên và lỗi theo từng ID. Lệnh chọn ID riêng hoặc danh sách phân tách bằng dấu phẩy. Không biên dịch starter và solution cùng lúc.

**Gợi ý:** dùng `py scripts/learn.py hint JP01 --level 1`, rồi tăng tới 2 hoặc 3 khi cần. Trên web mở từng mức và ghi mức hỗ trợ trong tiến độ.


## JP02 — Hai biến, một object

**Kỹ năng:** Class/object và tham chiếu. **Tiên quyết:** JP01.

**Mức:** 1. Đọc hiểu. **Phạm vi:** Bắt buộc.

**Hợp đồng và ví dụ đầu vào/đầu ra:** Dự đoán rồi điền referenceTrace(): var a=new ArrayList<>(List.of("Java")); var b=a; b.add("SQL"); return a.size()+":"+b.size();. Kết quả "2:2". Giải thích bằng sơ đồ hai biến cùng trỏ một danh sách.

**Tiêu chí hoàn thành:** tự viết hoặc sửa phương thức, giữ đúng hợp đồng và ca lỗi; chạy `py scripts/check.py --track java-pilot --id JP02`; ghi input, expected/actual và giải thích ít nhất một ca biên. Với bài đọc hiểu, lưu dự đoán trước khi chạy; debug lưu lỗi trước/sau; thử thách giải thích lựa chọn thiết kế. Test đạt mà không giải thích được thì quay lại bài học.

**Kiểm tra:** [PilotChecks](tests/PilotChecks.java) có ca bình thường, biên và lỗi theo từng ID. Lệnh chọn ID riêng hoặc danh sách phân tách bằng dấu phẩy. Không biên dịch starter và solution cùng lúc.

**Gợi ý:** dùng `py scripts/learn.py hint JP02 --level 1`, rồi tăng tới 2 hoặc 3 khi cần. Trên web mở từng mức và ghi mức hỗ trợ trong tiến độ.


## JP03 — Hoàn thiện phương thức chuẩn hóa

**Kỹ năng:** Phương thức và validation. **Tiên quyết:** JP01.

**Mức:** 2. Có hướng dẫn. **Phạm vi:** Bắt buộc.

**Hợp đồng và ví dụ đầu vào/đầu ra:** Viết normalize(String): null hoặc blank ném IllegalArgumentException; còn lại strip hai đầu. "  Java  " → "Java"; " \t" → lỗi. Khung: if (____) throw new IllegalArgumentException(); return ____;. Không đổi chữ hoa/thường.

**Tiêu chí hoàn thành:** tự viết hoặc sửa phương thức, giữ đúng hợp đồng và ca lỗi; chạy `py scripts/check.py --track java-pilot --id JP03`; ghi input, expected/actual và giải thích ít nhất một ca biên. Với bài đọc hiểu, lưu dự đoán trước khi chạy; debug lưu lỗi trước/sau; thử thách giải thích lựa chọn thiết kế. Test đạt mà không giải thích được thì quay lại bài học.

**Kiểm tra:** [PilotChecks](tests/PilotChecks.java) có ca bình thường, biên và lỗi theo từng ID. Lệnh chọn ID riêng hoặc danh sách phân tách bằng dấu phẩy. Không biên dịch starter và solution cùng lúc.

**Gợi ý:** dùng `py scripts/learn.py hint JP03 --level 1`, rồi tăng tới 2 hoặc 3 khi cần. Trên web mở từng mức và ghi mức hỗ trợ trong tiến độ.


## JP04 — Trace thêm và xóa List

**Kỹ năng:** List, index và thứ tự. **Tiên quyết:** JP02.

**Mức:** 1. Đọc hiểu. **Phạm vi:** Bắt buộc.

**Hợp đồng và ví dụ đầu vào/đầu ra:** Điền listTrace() từ: var a=new ArrayList<>(List.of("A","B","C")); a.remove(1); a.add("D");. Trả [A,C,D]. Ghi chỉ số sau mỗi thao tác; phân biệt remove(1) với remove("B").

**Tiêu chí hoàn thành:** tự viết hoặc sửa phương thức, giữ đúng hợp đồng và ca lỗi; chạy `py scripts/check.py --track java-pilot --id JP04`; ghi input, expected/actual và giải thích ít nhất một ca biên. Với bài đọc hiểu, lưu dự đoán trước khi chạy; debug lưu lỗi trước/sau; thử thách giải thích lựa chọn thiết kế. Test đạt mà không giải thích được thì quay lại bài học.

**Kiểm tra:** [PilotChecks](tests/PilotChecks.java) có ca bình thường, biên và lỗi theo từng ID. Lệnh chọn ID riêng hoặc danh sách phân tách bằng dấu phẩy. Không biên dịch starter và solution cùng lúc.

**Gợi ý:** dùng `py scripts/learn.py hint JP04 --level 1`, rồi tăng tới 2 hoặc 3 khi cần. Trên web mở từng mức và ghi mức hỗ trợ trong tiến độ.


## JP05 — Điền tìm tài liệu theo ID

**Kỹ năng:** List, Optional, vòng lặp. **Tiên quyết:** JP04, JP03.

**Mức:** 2. Có hướng dẫn. **Phạm vi:** Bắt buộc.

**Hợp đồng và ví dụ đầu vào/đầu ra:** Hoàn thiện find(List<Doc>,long) trong starter: khi doc.id()==id trả Optional.of(doc); hết vòng trả Optional.empty(). [(1,Java),(2,SQL)],2 → Optional[Doc(2,SQL)]; list rỗng hoặc không có ID → empty. Không sửa list, ID là identity, tiêu đề có thể trùng.

**Tiêu chí hoàn thành:** tự viết hoặc sửa phương thức, giữ đúng hợp đồng và ca lỗi; chạy `py scripts/check.py --track java-pilot --id JP05`; ghi input, expected/actual và giải thích ít nhất một ca biên. Với bài đọc hiểu, lưu dự đoán trước khi chạy; debug lưu lỗi trước/sau; thử thách giải thích lựa chọn thiết kế. Test đạt mà không giải thích được thì quay lại bài học.

**Kiểm tra:** [PilotChecks](tests/PilotChecks.java) có ca bình thường, biên và lỗi theo từng ID. Lệnh chọn ID riêng hoặc danh sách phân tách bằng dấu phẩy. Không biên dịch starter và solution cùng lúc.

**Gợi ý:** dùng `py scripts/learn.py hint JP05 --level 1`, rồi tăng tới 2 hoặc 3 khi cần. Trên web mở từng mức và ghi mức hỗ trợ trong tiến độ.


## JP06 — Điền bộ đếm Map

**Kỹ năng:** Map, getOrDefault và merge. **Tiên quyết:** JP04.

**Mức:** 2. Có hướng dẫn. **Phạm vi:** Bắt buộc.

**Hợp đồng và ví dụ đầu vào/đầu ra:** Hoàn thiện count(List<String>): đếm chính xác từ có sẵn, phân biệt hoa/thường; [java,sql,java] → {java=2,sql=1}; [] → {}. Không đổi input. Điền cập nhật mỗi word trong vòng lặp rồi trả Map.copyOf(counts). Input không null và không chứa null.

**Tiêu chí hoàn thành:** tự viết hoặc sửa phương thức, giữ đúng hợp đồng và ca lỗi; chạy `py scripts/check.py --track java-pilot --id JP06`; ghi input, expected/actual và giải thích ít nhất một ca biên. Với bài đọc hiểu, lưu dự đoán trước khi chạy; debug lưu lỗi trước/sau; thử thách giải thích lựa chọn thiết kế. Test đạt mà không giải thích được thì quay lại bài học.

**Kiểm tra:** [PilotChecks](tests/PilotChecks.java) có ca bình thường, biên và lỗi theo từng ID. Lệnh chọn ID riêng hoặc danh sách phân tách bằng dấu phẩy. Không biên dịch starter và solution cùng lúc.

**Gợi ý:** dùng `py scripts/learn.py hint JP06 --level 1`, rồi tăng tới 2 hoặc 3 khi cần. Trên web mở từng mức và ghi mức hỗ trợ trong tiến độ.


## JP07 — Tạo object hợp lệ

**Kỹ năng:** Constructor, invariant, phương thức tạo. **Tiên quyết:** JP03, JP02.

**Mức:** 3. Tự triển khai. **Phạm vi:** Bắt buộc.

**Hợp đồng và ví dụ đầu vào/đầu ra:** Viết create(long,String) như cổng tạo Doc: ID phải dương, title nonblank, strip; create(1," Java ") → Doc(1,Java). ID 0/-1, null, title trắng → IllegalArgumentException. Doc record chỉ là payload; create là nơi áp dụng invariant trong lab.

**Tiêu chí hoàn thành:** tự viết hoặc sửa phương thức, giữ đúng hợp đồng và ca lỗi; chạy `py scripts/check.py --track java-pilot --id JP07`; ghi input, expected/actual và giải thích ít nhất một ca biên. Với bài đọc hiểu, lưu dự đoán trước khi chạy; debug lưu lỗi trước/sau; thử thách giải thích lựa chọn thiết kế. Test đạt mà không giải thích được thì quay lại bài học.

**Kiểm tra:** [PilotChecks](tests/PilotChecks.java) có ca bình thường, biên và lỗi theo từng ID. Lệnh chọn ID riêng hoặc danh sách phân tách bằng dấu phẩy. Không biên dịch starter và solution cùng lúc.

**Gợi ý:** dùng `py scripts/learn.py hint JP07 --level 1`, rồi tăng tới 2 hoặc 3 khi cần. Trên web mở từng mức và ghi mức hỗ trợ trong tiến độ.


## JP08 — Từ chối ID trùng

**Kỹ năng:** Map, identity và invariant. **Tiên quyết:** JP07, JP06.

**Mức:** 3. Tự triển khai. **Phạm vi:** Bắt buộc.

**Hợp đồng và ví dụ đầu vào/đầu ra:** Viết add(Map<Long,Doc>,Doc): validate bằng create, từ chối ID đã có bằng IllegalArgumentException, giữ bản cũ. Thêm (1,Java) rồi (1,SQL) → lỗi và map vẫn {1=Java}. ID sai cũng không thay đổi map. Catalog của lab chạy một luồng; bài JP20 luyện đồng thời.

**Tiêu chí hoàn thành:** tự viết hoặc sửa phương thức, giữ đúng hợp đồng và ca lỗi; chạy `py scripts/check.py --track java-pilot --id JP08`; ghi input, expected/actual và giải thích ít nhất một ca biên. Với bài đọc hiểu, lưu dự đoán trước khi chạy; debug lưu lỗi trước/sau; thử thách giải thích lựa chọn thiết kế. Test đạt mà không giải thích được thì quay lại bài học.

**Kiểm tra:** [PilotChecks](tests/PilotChecks.java) có ca bình thường, biên và lỗi theo từng ID. Lệnh chọn ID riêng hoặc danh sách phân tách bằng dấu phẩy. Không biên dịch starter và solution cùng lúc.

**Gợi ý:** dùng `py scripts/learn.py hint JP08 --level 1`, rồi tăng tới 2 hoặc 3 khi cần. Trên web mở từng mức và ghi mức hỗ trợ trong tiến độ.


## JP09 — Bảo vệ dữ liệu bên trong

**Kỹ năng:** Defensive copy, immutable snapshot. **Tiên quyết:** JP04, JP07.

**Mức:** 3. Tự triển khai. **Phạm vi:** Bắt buộc.

**Hợp đồng và ví dụ đầu vào/đầu ra:** Viết snapshot(Collection<Doc>): bản chụp List không sửa được và không thay đổi khi input thêm/xóa. Input [(1,A)] → snapshot [(1,A)]; input.clear() vẫn giữ snapshot; snapshot.clear() ném UnsupportedOperationException. Doc record chứa String nên phần tử bất biến.

**Tiêu chí hoàn thành:** tự viết hoặc sửa phương thức, giữ đúng hợp đồng và ca lỗi; chạy `py scripts/check.py --track java-pilot --id JP09`; ghi input, expected/actual và giải thích ít nhất một ca biên. Với bài đọc hiểu, lưu dự đoán trước khi chạy; debug lưu lỗi trước/sau; thử thách giải thích lựa chọn thiết kế. Test đạt mà không giải thích được thì quay lại bài học.

**Kiểm tra:** [PilotChecks](tests/PilotChecks.java) có ca bình thường, biên và lỗi theo từng ID. Lệnh chọn ID riêng hoặc danh sách phân tách bằng dấu phẩy. Không biên dịch starter và solution cùng lúc.

**Gợi ý:** dùng `py scripts/learn.py hint JP09 --level 1`, rồi tăng tới 2 hoặc 3 khi cần. Trên web mở từng mức và ghi mức hỗ trợ trong tiến độ.


## JP10 — Đổi tiêu đề không mất trạng thái

**Kỹ năng:** Validation và cập nhật Map. **Tiên quyết:** JP08, JP09.

**Mức:** 3. Tự triển khai. **Phạm vi:** Bắt buộc.

**Hợp đồng và ví dụ đầu vào/đầu ra:** Viết rename(Map<Long,Doc>,id,title). ID vắng → NoSuchElementException; title sai → IllegalArgumentException; lỗi giữ nguyên map. {1=A}, rename(1," B ") → {1=B}; tiếp tục rename(1," ") → lỗi và vẫn B.

**Tiêu chí hoàn thành:** tự viết hoặc sửa phương thức, giữ đúng hợp đồng và ca lỗi; chạy `py scripts/check.py --track java-pilot --id JP10`; ghi input, expected/actual và giải thích ít nhất một ca biên. Với bài đọc hiểu, lưu dự đoán trước khi chạy; debug lưu lỗi trước/sau; thử thách giải thích lựa chọn thiết kế. Test đạt mà không giải thích được thì quay lại bài học.

**Kiểm tra:** [PilotChecks](tests/PilotChecks.java) có ca bình thường, biên và lỗi theo từng ID. Lệnh chọn ID riêng hoặc danh sách phân tách bằng dấu phẩy. Không biên dịch starter và solution cùng lúc.

**Gợi ý:** dùng `py scripts/learn.py hint JP10 --level 1`, rồi tăng tới 2 hoặc 3 khi cần. Trên web mở từng mức và ghi mức hỗ trợ trong tiến độ.


## JP11 — Chuyển chuỗi sang ID

**Kỹ năng:** Exception, parsing và lỗi biên. **Tiên quyết:** JP03.

**Mức:** 3. Tự triển khai. **Phạm vi:** Bắt buộc.

**Hợp đồng và ví dụ đầu vào/đầu ra:** Viết parseId(String): strip, parseLong, chỉ nhận số dương. " 12 " → 12; "x", "0", "-1", null và "9223372036854775808" → IllegalArgumentException. Giữ nguyên cause khi bọc lỗi parse/null; không trả 0 thay lỗi.

**Tiêu chí hoàn thành:** tự viết hoặc sửa phương thức, giữ đúng hợp đồng và ca lỗi; chạy `py scripts/check.py --track java-pilot --id JP11`; ghi input, expected/actual và giải thích ít nhất một ca biên. Với bài đọc hiểu, lưu dự đoán trước khi chạy; debug lưu lỗi trước/sau; thử thách giải thích lựa chọn thiết kế. Test đạt mà không giải thích được thì quay lại bài học.

**Kiểm tra:** [PilotChecks](tests/PilotChecks.java) có ca bình thường, biên và lỗi theo từng ID. Lệnh chọn ID riêng hoặc danh sách phân tách bằng dấu phẩy. Không biên dịch starter và solution cùng lúc.

**Gợi ý:** dùng `py scripts/learn.py hint JP11 --level 1`, rồi tăng tới 2 hoặc 3 khi cần. Trên web mở từng mức và ghi mức hỗ trợ trong tiến độ.


## JP12 — Đọc file UTF-8

**Kỹ năng:** File, tài nguyên và IOException. **Tiên quyết:** JP11.

**Mức:** 3. Tự triển khai. **Phạm vi:** Bắt buộc.

**Hợp đồng và ví dụ đầu vào/đầu ra:** Viết readTitles(Path): UTF-8, strip, bỏ dòng trắng, giữ thứ tự. File " Tiếng Việt \r\n\nJava\n" → [Tiếng Việt,Java]; file trống → []; file thiếu → IOException. Đóng stream ngay cả khi lỗi, không chuyển lỗi thành [].

**Tiêu chí hoàn thành:** tự viết hoặc sửa phương thức, giữ đúng hợp đồng và ca lỗi; chạy `py scripts/check.py --track java-pilot --id JP12`; ghi input, expected/actual và giải thích ít nhất một ca biên. Với bài đọc hiểu, lưu dự đoán trước khi chạy; debug lưu lỗi trước/sau; thử thách giải thích lựa chọn thiết kế. Test đạt mà không giải thích được thì quay lại bài học.

**Kiểm tra:** [PilotChecks](tests/PilotChecks.java) có ca bình thường, biên và lỗi theo từng ID. Lệnh chọn ID riêng hoặc danh sách phân tách bằng dấu phẩy. Không biên dịch starter và solution cùng lúc.

**Gợi ý:** dùng `py scripts/learn.py hint JP12 --level 1`, rồi tăng tới 2 hoặc 3 khi cần. Trên web mở từng mức và ghi mức hỗ trợ trong tiến độ.


## JP13 — Tìm kiếm và sắp xếp ổn định

**Kỹ năng:** Collections, comparator, validation. **Tiên quyết:** JP08, JP09.

**Mức:** 4. Kết hợp. **Phạm vi:** Bắt buộc.

**Hợp đồng và ví dụ đầu vào/đầu ra:** Viết search(Collection<Doc>,query): strip query, không phân biệt hoa/thường bằng Locale.ROOT; blank → IllegalArgumentException; tìm contains; sắp title tự nhiên rồi ID tăng. [(3,Java),(2,SQL),(1,Java)]," JAVA " → [(1,Java),(3,Java)]. Không thay thứ tự input; không có kết quả → [].

**Tiêu chí hoàn thành:** tự viết hoặc sửa phương thức, giữ đúng hợp đồng và ca lỗi; chạy `py scripts/check.py --track java-pilot --id JP13`; ghi input, expected/actual và giải thích ít nhất một ca biên. Với bài đọc hiểu, lưu dự đoán trước khi chạy; debug lưu lỗi trước/sau; thử thách giải thích lựa chọn thiết kế. Test đạt mà không giải thích được thì quay lại bài học.

**Kiểm tra:** [PilotChecks](tests/PilotChecks.java) có ca bình thường, biên và lỗi theo từng ID. Lệnh chọn ID riêng hoặc danh sách phân tách bằng dấu phẩy. Không biên dịch starter và solution cùng lúc.

**Gợi ý:** dùng `py scripts/learn.py hint JP13 --level 1`, rồi tăng tới 2 hoặc 3 khi cần. Trên web mở từng mức và ghi mức hỗ trợ trong tiến độ.


## JP14 — Nhập danh mục nguyên tử

**Kỹ năng:** Parsing, Map, exception và rollback. **Tiên quyết:** JP08, JP11.

**Mức:** 4. Kết hợp. **Phạm vi:** Bắt buộc.

**Hợp đồng và ví dụ đầu vào/đầu ra:** Viết importRows(Map,List<String>) với định dạng id|title, đúng hai cột; áp dụng create/add. {1=A} + ["2|B","1|C"] → lỗi và vẫn {1=A}. Thành công ["2| B "] → thêm 2=B. ID trùng trong cùng batch cũng từ chối, dữ liệu sai giữa batch không được nhập một phần. Không có concurrency trong hợp đồng này.

**Tiêu chí hoàn thành:** tự viết hoặc sửa phương thức, giữ đúng hợp đồng và ca lỗi; chạy `py scripts/check.py --track java-pilot --id JP14`; ghi input, expected/actual và giải thích ít nhất một ca biên. Với bài đọc hiểu, lưu dự đoán trước khi chạy; debug lưu lỗi trước/sau; thử thách giải thích lựa chọn thiết kế. Test đạt mà không giải thích được thì quay lại bài học.

**Kiểm tra:** [PilotChecks](tests/PilotChecks.java) có ca bình thường, biên và lỗi theo từng ID. Lệnh chọn ID riêng hoặc danh sách phân tách bằng dấu phẩy. Không biên dịch starter và solution cùng lúc.

**Gợi ý:** dùng `py scripts/learn.py hint JP14 --level 1`, rồi tăng tới 2 hoặc 3 khi cần. Trên web mở từng mức và ghi mức hỗ trợ trong tiến độ.


## JP15 — Lưu và tải lại danh mục

**Kỹ năng:** File UTF-8, sorting, import. **Tiên quyết:** JP12, JP14.

**Mức:** 4. Kết hợp. **Phạm vi:** Bắt buộc.

**Hợp đồng và ví dụ đầu vào/đầu ra:** Viết save(Path,Collection<Doc>): sort ID tăng, mỗi dòng id|title, UTF-8. [(2,Tiếng Việt),(1,Java)] → hai dòng "1|Java", "2|Tiếng Việt". Dùng importRows đọc lại và so dữ liệu. Title chứa |, CR hoặc LF phải từ chối trước khi ghi, file cũ giữ nguyên khi validation lỗi. IOException vẫn truyền ra; không yêu cầu chống mất điện/ghi file nguyên tử.

**Tiêu chí hoàn thành:** tự viết hoặc sửa phương thức, giữ đúng hợp đồng và ca lỗi; chạy `py scripts/check.py --track java-pilot --id JP15`; ghi input, expected/actual và giải thích ít nhất một ca biên. Với bài đọc hiểu, lưu dự đoán trước khi chạy; debug lưu lỗi trước/sau; thử thách giải thích lựa chọn thiết kế. Test đạt mà không giải thích được thì quay lại bài học.

**Kiểm tra:** [PilotChecks](tests/PilotChecks.java) có ca bình thường, biên và lỗi theo từng ID. Lệnh chọn ID riêng hoặc danh sách phân tách bằng dấu phẩy. Không biên dịch starter và solution cùng lúc.

**Gợi ý:** dùng `py scripts/learn.py hint JP15 --level 1`, rồi tăng tới 2 hoặc 3 khi cần. Trên web mở từng mức và ghi mức hỗ trợ trong tiến độ.


## JP16 — Báo cáo danh mục

**Kỹ năng:** OOP, phương thức, Map và snapshot. **Tiên quyết:** JP06, JP07, JP09.

**Mức:** 4. Kết hợp. **Phạm vi:** Bắt buộc.

**Hợp đồng và ví dụ đầu vào/đầu ra:** Viết summarize(Collection<Doc>) cho Doc hợp lệ: trả Summary(count,initials), lấy ký tự đầu title rồi uppercase Locale.ROOT. [(1,Java),(2,JUnit),(3,SQL)] → (3,{J=2,S=1}); [] → (0,{}). Map kết quả không sửa được. Không thay input.

**Tiêu chí hoàn thành:** tự viết hoặc sửa phương thức, giữ đúng hợp đồng và ca lỗi; chạy `py scripts/check.py --track java-pilot --id JP16`; ghi input, expected/actual và giải thích ít nhất một ca biên. Với bài đọc hiểu, lưu dự đoán trước khi chạy; debug lưu lỗi trước/sau; thử thách giải thích lựa chọn thiết kế. Test đạt mà không giải thích được thì quay lại bài học.

**Kiểm tra:** [PilotChecks](tests/PilotChecks.java) có ca bình thường, biên và lỗi theo từng ID. Lệnh chọn ID riêng hoặc danh sách phân tách bằng dấu phẩy. Không biên dịch starter và solution cùng lúc.

**Gợi ý:** dùng `py scripts/learn.py hint JP16 --level 1`, rồi tăng tới 2 hoặc 3 khi cần. Trên web mở từng mức và ghi mức hỗ trợ trong tiến độ.


## JP17 — Debug xóa phần tử liên tiếp

**Kỹ năng:** Debug List và off-by-one. **Tiên quyết:** JP04, JP09.

**Mức:** Debug. **Phạm vi:** Bắt buộc.

**Hợp đồng và ví dụ đầu vào/đầu ra:** Sửa removeBlank trong starter cố ý sai: copy input; duyệt i tăng, xóa phần tử blank tại i. [""," ","Java",""] phải → [Java], input giữ nguyên. Ghi expected/actual, nguyên nhân và ca hai blank liên tiếp trước khi sửa. Output không yêu cầu mutable.

**Tiêu chí hoàn thành:** tự viết hoặc sửa phương thức, giữ đúng hợp đồng và ca lỗi; chạy `py scripts/check.py --track java-pilot --id JP17`; ghi input, expected/actual và giải thích ít nhất một ca biên. Với bài đọc hiểu, lưu dự đoán trước khi chạy; debug lưu lỗi trước/sau; thử thách giải thích lựa chọn thiết kế. Test đạt mà không giải thích được thì quay lại bài học.

**Kiểm tra:** [PilotChecks](tests/PilotChecks.java) có ca bình thường, biên và lỗi theo từng ID. Lệnh chọn ID riêng hoặc danh sách phân tách bằng dấu phẩy. Không biên dịch starter và solution cùng lúc.

**Gợi ý:** dùng `py scripts/learn.py hint JP17 --level 1`, rồi tăng tới 2 hoặc 3 khi cần. Trên web mở từng mức và ghi mức hỗ trợ trong tiến độ.


## JP18 — Debug tổng bị tràn

**Kỹ năng:** Debug kiểu số và overflow. **Tiên quyết:** JP01.

**Mức:** Debug. **Phạm vi:** Bắt buộc.

**Hợp đồng và ví dụ đầu vào/đầu ra:** Sửa sum(int[]) có accumulator int rồi return long. [2147483647,2147483647] phải → 4294967294L, [-5,-3] → -8L, [] → 0L. Trace loại dữ liệu của phép cộng và giải thích vì sao ép long ở return quá muộn.

**Tiêu chí hoàn thành:** tự viết hoặc sửa phương thức, giữ đúng hợp đồng và ca lỗi; chạy `py scripts/check.py --track java-pilot --id JP18`; ghi input, expected/actual và giải thích ít nhất một ca biên. Với bài đọc hiểu, lưu dự đoán trước khi chạy; debug lưu lỗi trước/sau; thử thách giải thích lựa chọn thiết kế. Test đạt mà không giải thích được thì quay lại bài học.

**Kiểm tra:** [PilotChecks](tests/PilotChecks.java) có ca bình thường, biên và lỗi theo từng ID. Lệnh chọn ID riêng hoặc danh sách phân tách bằng dấu phẩy. Không biên dịch starter và solution cùng lúc.

**Gợi ý:** dùng `py scripts/learn.py hint JP18 --level 1`, rồi tăng tới 2 hoặc 3 khi cần. Trên web mở từng mức và ghi mức hỗ trợ trong tiến độ.


## JP19 — Khóa ghép cho nhiều người dùng

**Kỹ năng:** Identity, equals/hashCode và thiết kế. **Tiên quyết:** JP08, JP09, JP16.

**Mức:** 5. Thử thách. **Phạm vi:** Mở rộng, chỉ sau đủ nền tảng.

**Hợp đồng và ví dụ đầu vào/đầu ra:** Viết distinctOwned(List<Owned>): input owner nonblank/id dương/title hợp lệ; loại trùng theo cặp (owner,id), giữ payload đầu và thứ tự lần đầu, trả snapshot. [(an,1,A),(an,1,new),(binh,1,B)] → [(an,1,A),(binh,1,B)]. Giải thích chọn record Key thay vì nối chuỗi; cùng ID ở owner khác không được mất.

**Tiêu chí hoàn thành:** tự viết hoặc sửa phương thức, giữ đúng hợp đồng và ca lỗi; chạy `py scripts/check.py --track java-pilot --id JP19`; ghi input, expected/actual và giải thích ít nhất một ca biên. Với bài đọc hiểu, lưu dự đoán trước khi chạy; debug lưu lỗi trước/sau; thử thách giải thích lựa chọn thiết kế. Test đạt mà không giải thích được thì quay lại bài học.

**Kiểm tra:** [PilotChecks](tests/PilotChecks.java) có ca bình thường, biên và lỗi theo từng ID. Lệnh chọn ID riêng hoặc danh sách phân tách bằng dấu phẩy. Không biên dịch starter và solution cùng lúc.

**Gợi ý:** dùng `py scripts/learn.py hint JP19 --level 1`, rồi tăng tới 2 hoặc 3 khi cần. Trên web mở từng mức và ghi mức hỗ trợ trong tiến độ.


## JP20 — Hai cập nhật cùng phiên bản

**Kỹ năng:** Concurrency, version và invariant. **Tiên quyết:** JP10, JP14, JP19.

**Mức:** 5. Thử thách. **Phạm vi:** Mở rộng, chỉ sau đủ nền tảng.

**Hợp đồng và ví dụ đầu vào/đầu ra:** Hoàn thiện RevisionBox: ban đầu (version=0,title=Java). rename(expectedVersion,next) validate title, chỉ cập nhật khi version trùng; thành công tăng version một lần và trả true, stale trả false. Hai thread cùng expectedVersion=0: đúng một true, version=1. Getter phải đọc trạng thái nhất quán. Title sai ném IllegalArgumentException, không đổi version. Giải thích phạm vi một JVM và hướng transaction/optimistic locking khi lên API.

**Tiêu chí hoàn thành:** tự viết hoặc sửa phương thức, giữ đúng hợp đồng và ca lỗi; chạy `py scripts/check.py --track java-pilot --id JP20`; ghi input, expected/actual và giải thích ít nhất một ca biên. Với bài đọc hiểu, lưu dự đoán trước khi chạy; debug lưu lỗi trước/sau; thử thách giải thích lựa chọn thiết kế. Test đạt mà không giải thích được thì quay lại bài học.

**Kiểm tra:** [PilotChecks](tests/PilotChecks.java) có ca bình thường, biên và lỗi theo từng ID. Lệnh chọn ID riêng hoặc danh sách phân tách bằng dấu phẩy. Không biên dịch starter và solution cùng lúc.

**Gợi ý:** dùng `py scripts/learn.py hint JP20 --level 1`, rồi tăng tới 2 hoặc 3 khi cần. Trên web mở từng mức và ghi mức hỗ trợ trong tiến độ.
