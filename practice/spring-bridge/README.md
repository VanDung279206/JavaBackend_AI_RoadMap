# Ba bước trước bài Spring tổng hợp

SPRB01 → SPRB02 → SPRB03 luyện một khái niệm mỗi lần. JDK 17+ (khuyến nghị 21), Python 3; launcher tải Maven/dependencies lần đầu. Test dùng Bean Validation và Spring/JPA với H2 thật ở profile demo; không cần PostgreSQL/Docker để làm ba bài này. H2 không thay cho các integration test PostgreSQL của dự án.

Từ gốc repo, tạo **một lần** mỗi bản học bằng `new_spring_lab.py --phase 3 --step … --destination …` theo lệnh của từng bài. Script từ chối ghi đè; các lần sau chỉ chạy dòng Maven trên bản đã tạo. Trên Windows dùng `py`; Linux/macOS thay bằng Python 3. Không sửa app tham chiếu và không ghi PASS từ tham chiếu vào tiến độ cá nhân.

Trước khi sửa, test được chọn phải FAIL. Đọc assertion đầu tiên, dự đoán bản sửa, chạy lại. Khi đạt, lưu lệnh, output và 2–3 câu tiếng Anh. Lệnh toàn bộ ba contract: `py scripts/maven.py -f <bản-học>/pom.xml "-Dtest=Bridge*Test" test`. Sau ba bước, chuyển sang P3.1–P3.4 và integration PostgreSQL.

## SPRB01 — Điền validation trên DTO

Tiên quyết: P2.1 và bài SPRING01. Tạo bản riêng:

```bash
py scripts/new_spring_lab.py --phase 3 --step validation --destination work/spring-bridge-validation
py scripts/maven.py -f work/spring-bridge-validation/pom.xml -Dtest=BridgeValidationTest test
```

Sửa duy nhất record `WriteDocument` trong `src/main/java/vn/roadmap/knowledge/ApiTypes.java`. Title phải không null, không trắng và dài tối đa 120 ký tự; content không null và tối đa 20.000 ký tự, nhưng **chuỗi rỗng hợp lệ**.

Input → output: title “Java”, content “” → không violation; title dài 120/content dài 20.000 → hợp lệ; title null/trắng/121 ký tự → violation ở `title`; content null/20.001 → violation ở `content`; cả hai null → cả hai field lỗi.

Test gọi Validator trực tiếp để service/constraint database không che mất annotation còn thiếu. Controller tham chiếu đã có `@Valid`; bài này chưa kiểm toàn bộ HTTP/error response của P3.1.

Giải thích tiếng Anh: “NotBlank rejects … . NotNull allows … . Size checks … .”

## SPRB02 — Nối service với repository theo owner

Tiên quyết: SPRB01 và bài SPRING02. Tạo bản riêng:

```bash
py scripts/new_spring_lab.py --phase 3 --step repository --destination work/spring-bridge-repository
py scripts/maven.py -f work/spring-bridge-repository/pom.xml -Dtest=BridgeRepositoryTest test
```

Sửa `requireOwned(owner,id)` trong `DocumentService.java`. Dùng `DocumentRepository` đã inject; trả entity có **cả ID và owner khớp**, còn lại ném `AppErrors.Missing`.

Input: An và Bình có hai tài liệu riêng. An đọc ID của An → entity của An; Bình đọc ID của Bình → entity của Bình; đọc chéo owner, ID chưa tồn tại và ID âm → Missing. Lookup không được sửa nội dung hoặc tạo thêm hàng.

Không lấy một tài liệu bất kỳ của owner; không tìm bằng ID đơn lẻ rồi trả ngay. Repository sẵn có `findByIdAndOwnerId`; test thực sự lưu/đọc qua JPA/H2.

Giải thích tiếng Anh: “The lookup requires … . A missing or differently owned document … .”

## SPRB03 — Một transaction cho document và audit

Tiên quyết: SPRB02, P2.4 và bài SPRING03. Tạo bản riêng:

```bash
py scripts/new_spring_lab.py --phase 3 --step transaction --destination work/spring-bridge-transaction
py scripts/maven.py -f work/spring-bridge-transaction/pom.xml -Dtest=BridgeTransactionTest test
```

Sửa ranh giới transaction của `create` trong `DocumentService.java`. Service lưu document bằng `saveAndFlush` rồi viết audit; **cả hai cùng commit hoặc cùng rollback**.

Nhánh thành công: create “Commit” của An → sau method có một document và một audit “CREATED” đúng ID/actor. Nhánh lỗi: audit đã INSERT thật rồi ném `IllegalStateException` → sau method có 0 document, 0 audit và exception vẫn tới caller.

Test gọi bean service qua Spring proxy, không đặt transaction trên test để tránh test tự rollback che lỗi. Spy chỉ gây lỗi sau audit insert; H2 lưu cả hai bảng thật. Không bắt lỗi rồi trả thành công, không chỉ đặt transaction quanh repository hoặc dùng `REQUIRES_NEW` cho audit.

Giải thích tiếng Anh: “The service transaction includes … . If the audit step throws … . Flushing does not mean … .”

Tham khảo [Spring declarative rollback](https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/rolling-back.html). Chưa có đánh giá độ khó với người học mới; ghi thời gian, số lần dùng gợi ý và chỗ mắc trước khi mở rộng sang thử thách tổng hợp.
