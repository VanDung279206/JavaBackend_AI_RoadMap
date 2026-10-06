# Lời giải Java thí điểm

Chạy `py scripts/check.py --track java-pilot --mode solution --id all` chỉ kiểm bản tham chiếu; không ghi tiến độ người học. Xem [mã đầy đủ](solution/PilotLab.java).


## JP01 — Trace vòng lặp

Mỗi vòng chỉ dùng giá trị n hiện tại. Phép chia int xảy ra trước phép cộng. Đổi dữ liệu thành số lẻ để nhận biết chia nguyên.

```java
public static int trace() { int total=0; for(int n:new int[]{2,4,6}) total+=n/2; return total; }
```

Đối chiếu `py scripts/check.py --track java-pilot --id JP01` trên starter của bạn; thêm một input mới và giải thích kết quả trước khi đánh dấu đã làm.


## JP02 — Hai biến, một object

Gán tham chiếu không sao chép dữ liệu. new ArrayList<>(a) tạo bản sao cấu trúc; phần tử vẫn có thể dùng chung nếu mutable.

```java
public static String referenceTrace() { var a=new ArrayList<>(List.of("Java")); var b=a; b.add("SQL"); return a.size()+":"+b.size(); }
```

Đối chiếu `py scripts/check.py --track java-pilot --id JP02` trên starter của bạn; thêm một input mới và giải thích kết quả trước khi đánh dấu đã làm.


## JP03 — Hoàn thiện phương thức chuẩn hóa

Toán tử || dừng sớm tránh NullPointerException. String bất biến nên caller giữ nguyên chuỗi cũ.

```java
public static String normalize(String title) { if(title==null||title.isBlank()) throw new IllegalArgumentException("blank title"); return title.strip(); }
```

Đối chiếu `py scripts/check.py --track java-pilot --id JP03` trên starter của bạn; thêm một input mới và giải thích kết quả trước khi đánh dấu đã làm.


## JP04 — Trace thêm và xóa List

remove(int) xóa theo vị trí; remove(Object) xóa phần tử đầu tiên bằng equals. Với List<Integer>, Integer.valueOf(1) chọn overload xóa giá trị.

```java
public static List<String> listTrace() { var a=new ArrayList<>(List.of("A","B","C")); a.remove(1); a.add("D"); return List.copyOf(a); }
```

Đối chiếu `py scripts/check.py --track java-pilot --id JP04` trên starter của bạn; thêm một input mới và giải thích kết quả trước khi đánh dấu đã làm.


## JP05 — Điền tìm tài liệu theo ID

Optional buộc caller xử lý vắng mặt. Test không tìm thấy trong list không rỗng phát hiện return quá sớm.

```java
public static Optional<Doc> find(List<Doc> docs, long id) { return docs.stream().filter(d->d.id()==id).findFirst(); }
```

Đối chiếu `py scripts/check.py --track java-pilot --id JP05` trên starter của bạn; thêm một input mới và giải thích kết quả trước khi đánh dấu đã làm.


## JP06 — Điền bộ đếm Map

Map là ánh xạ khóa sang giá trị; put(word,1) mỗi vòng làm mất lượt trước. Map.copyOf bảo vệ kết quả.

```java
public static Map<String,Integer> count(List<String> words) { var result=new LinkedHashMap<String,Integer>(); for(String word:words) result.merge(word,1,Integer::sum); return Map.copyOf(result); }
```

Đối chiếu `py scripts/check.py --track java-pilot --id JP06` trên starter của bạn; thêm một input mới và giải thích kết quả trước khi đánh dấu đã làm.


## JP07 — Tạo object hợp lệ

Dữ liệu sai bị chặn ngay tại biên tạo object. Trong dự án có thể chuyển validation vào compact constructor để mọi đường tạo đều giữ invariant.

```java
public static Doc create(long id, String title) { if(id<=0)throw new IllegalArgumentException("id must be positive"); return new Doc(id,normalize(title)); }
```

Hàm phụ: normalize/create đã triển khai ở JP03/JP07. Đối chiếu `py scripts/check.py --track java-pilot --id JP07` trên starter của bạn; thêm một input mới và giải thích kết quả trước khi đánh dấu đã làm.


## JP08 — Từ chối ID trùng

Thứ tự validate → kiểm trùng → ghi giữ dữ liệu cũ khi lỗi. containsKey rồi put không tự nguyên tử trong nhiều luồng.

```java
public static void add(Map<Long,Doc> docs, Doc doc) { Doc valid=create(doc.id(),doc.title()); if(docs.containsKey(valid.id()))throw new IllegalArgumentException("duplicate id"); docs.put(valid.id(),valid); }
```

Hàm phụ: normalize/create đã triển khai ở JP03/JP07. Đối chiếu `py scripts/check.py --track java-pilot --id JP08` trên starter của bạn; thêm một input mới và giải thích kết quả trước khi đánh dấu đã làm.


## JP09 — Bảo vệ dữ liệu bên trong

Wrapper quanh list gốc là live view, không phải snapshot. Với object mutable còn cần sao chép sâu hoặc dùng phần tử bất biến.

```java
public static List<Doc> snapshot(Collection<Doc> docs) { return List.copyOf(docs); }
```

Hàm phụ: normalize/create đã triển khai ở JP03/JP07. Đối chiếu `py scripts/check.py --track java-pilot --id JP09` trên starter của bạn; thêm một input mới và giải thích kết quả trước khi đánh dấu đã làm.


## JP10 — Đổi tiêu đề không mất trạng thái

Tạo toàn bộ giá trị mới trước mutation tránh xóa rồi mới phát hiện dữ liệu không hợp lệ. Record dễ bảo vệ snapshot cũ.

```java
public static void rename(Map<Long,Doc> docs,long id,String title) { if(!docs.containsKey(id))throw new NoSuchElementException("missing id"); Doc next=create(id,title); docs.put(id,next); }
```

Hàm phụ: normalize/create đã triển khai ở JP03/JP07. Đối chiếu `py scripts/check.py --track java-pilot --id JP10` trên starter của bạn; thêm một input mới và giải thích kết quả trước khi đánh dấu đã làm.


## JP11 — Chuyển chuỗi sang ID

Caller nhận hợp đồng lỗi thống nhất, cause giữ thông tin gốc để debug. Không bắt Exception rộng để nuốt lỗi lập trình.

```java
public static long parseId(String value) { try { long id=Long.parseLong(value.strip()); if(id<=0)throw new IllegalArgumentException("id must be positive"); return id; } catch(NullPointerException|NumberFormatException e) { throw new IllegalArgumentException("invalid id",e); } }
```

Hàm phụ: normalize/create đã triển khai ở JP03/JP07. Đối chiếu `py scripts/check.py --track java-pilot --id JP11` trên starter của bạn; thêm một input mới và giải thích kết quả trước khi đánh dấu đã làm.


## JP12 — Đọc file UTF-8

Files.lines mặc định UTF-8 và cần đóng. Test tạo file tạm giúp bài chạy lại được trên mọi máy.

```java
public static List<String> readTitles(Path file) throws IOException { try(var lines=Files.lines(file)) { return lines.map(String::strip).filter(s->!s.isEmpty()).toList(); } }
```

Hàm phụ: normalize/create đã triển khai ở JP03/JP07. Đối chiếu `py scripts/check.py --track java-pilot --id JP12` trên starter của bạn; thêm một input mới và giải thích kết quả trước khi đánh dấu đã làm.


## JP13 — Tìm kiếm và sắp xếp ổn định

Khóa phụ giữ thứ tự có thể dự đoán khi title hòa nhau. Locale.ROOT tránh hành vi khác theo locale máy.

```java
public static List<Doc> search(Collection<Doc> docs,String query) { String needle=normalize(query).toLowerCase(Locale.ROOT); return docs.stream().filter(d->d.title().toLowerCase(Locale.ROOT).contains(needle)).sorted(Comparator.comparing(Doc::title).thenComparingLong(Doc::id)).toList(); }
```

Hàm phụ: normalize/create đã triển khai ở JP03/JP07. Đối chiếu `py scripts/check.py --track java-pilot --id JP13` trên starter của bạn; thêm một input mới và giải thích kết quả trước khi đánh dấu đã làm.


## JP14 — Nhập danh mục nguyên tử

Staging là transaction trong bộ nhớ ở một luồng. Nó không thay thế transaction database hay kiểm soát đồng thời.

```java
public static void importRows(Map<Long,Doc> docs,List<String> rows) { var staged=new LinkedHashMap<>(docs); for(String row:rows) { String[] parts=row.split("\\|",-1); if(parts.length!=2)throw new IllegalArgumentException("expected id|title"); add(staged,create(parseId(parts[0]),parts[1])); } docs.clear(); docs.putAll(staged); }
```

Hàm phụ: normalize/create đã triển khai ở JP03/JP07. Đối chiếu `py scripts/check.py --track java-pilot --id JP14` trên starter của bạn; thêm một input mới và giải thích kết quả trước khi đánh dấu đã làm.


## JP15 — Lưu và tải lại danh mục

Kiểm delimiter bảo đảm round trip. Bài mở rộng có thể thay bằng JSON hoặc ghi file tạm rồi atomic move, nhưng phải nêu phạm vi bảo đảm.

```java
public static void save(Path file,Collection<Doc> docs) throws IOException { var rows=new ArrayList<String>(); for(Doc d:docs.stream().sorted(Comparator.comparingLong(Doc::id)).toList()) { Doc valid=create(d.id(),d.title()); if(valid.title().contains("|")||valid.title().contains("\n")||valid.title().contains("\r"))throw new IllegalArgumentException("unsupported delimiter"); rows.add(valid.id()+"|"+valid.title()); } Files.write(file,rows,java.nio.charset.StandardCharsets.UTF_8); }
```

Hàm phụ: normalize/create đã triển khai ở JP03/JP07. Đối chiếu `py scripts/check.py --track java-pilot --id JP15` trên starter của bạn; thêm một input mới và giải thích kết quả trước khi đánh dấu đã làm.


## JP16 — Báo cáo danh mục

Kết hợp phân nhóm, tính toán và đóng gói hợp đồng đầu ra. Nếu hỗ trợ emoji cần xác định code point thay vì UTF-16 char.

```java
public static Summary summarize(Collection<Doc> docs) { Map<String,Integer> initials=docs.stream().collect(Collectors.toMap(d->d.title().substring(0,1).toUpperCase(Locale.ROOT),d->1,Integer::sum)); return new Summary(docs.size(),Map.copyOf(initials)); }
```

Hàm phụ: normalize/create đã triển khai ở JP03/JP07. Đối chiếu `py scripts/check.py --track java-pilot --id JP16` trên starter của bạn; thêm một input mới và giải thích kết quả trước khi đánh dấu đã làm.


## JP17 — Debug xóa phần tử liên tiếp

Dữ liệu liên tiếp làm lộ lỗi dịch chỉ số, một blank đơn lẻ không đủ. Giữ phản ví dụ này trong regression test.

```java
public static List<String> removeBlank(List<String> titles) { return titles.stream().filter(s->!s.isBlank()).toList(); }
```

Đối chiếu `py scripts/check.py --track java-pilot --id JP17` trên starter của bạn; thêm một input mới và giải thích kết quả trước khi đánh dấu đã làm.


## JP18 — Debug tổng bị tràn

Mở rộng kiểu sau khi tràn không khôi phục giá trị gốc. Test âm và rỗng tránh sửa chỉ cho input lớn dương.

```java
public static long sum(int[] values) { long total=0; for(int value:values)total+=value; return total; }
```

Đối chiếu `py scripts/check.py --track java-pilot --id JP18` trên starter của bạn; thêm một input mới và giải thích kết quả trước khi đánh dấu đã làm.


## JP19 — Khóa ghép cho nhiều người dùng

Khóa bất biến dùng equality nhất quán với hashCode. Giữ đầu hay giữ cuối là quy tắc nghiệp vụ cần ghi rõ.

```java
public static List<Owned> distinctOwned(List<Owned> docs) { var byKey=new LinkedHashMap<Key,Owned>(); for(Owned d:docs)byKey.putIfAbsent(new Key(d.owner(),d.id()),d); return List.copyOf(byKey.values()); }
```

Hàm phụ: normalize/create đã triển khai ở JP03/JP07. Đối chiếu `py scripts/check.py --track java-pilot --id JP19` trên starter của bạn; thêm một input mới và giải thích kết quả trước khi đánh dấu đã làm.


## JP20 — Hai cập nhật cùng phiên bản

Bộ test dùng barrier cho hai tác vụ rồi kiểm số thành công. synchronized bảo vệ một instance trong một JVM; persistence cần ràng buộc/transaction hoặc @Version riêng.

```java
    public static final class RevisionBox {
        private long version=0;
        private String title="Java";
        public synchronized boolean rename(long expectedVersion,String next) { String valid=normalize(next); if(expectedVersion!=version)return false; title=valid; version++; return true; }
        public synchronized long version() { return version; }
        public synchronized String title() { return title; }
    }
```

Hàm phụ: normalize/create đã triển khai ở JP03/JP07. Đối chiếu `py scripts/check.py --track java-pilot --id JP20` trên starter của bạn; thêm một input mới và giải thích kết quả trước khi đánh dấu đã làm.
