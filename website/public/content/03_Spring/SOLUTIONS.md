# Lời giải Phase 3

Các đoạn Spring bên dưới là mẫu tích hợp vào ứng dụng đang học, không phải một ứng dụng Spring hoàn chỉnh. Chúng cần entity, bean, security và datasource tương ứng. Phần tính toán phân trang độc lập nằm trong [BackendLab.java](../../labs/src/BackendLab.java) và có kiểm tra chạy được.

## P3.1 — DTO

```java
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateDocumentRequest(
    @NotBlank @Size(max = 120) String title,
    @NotNull String content
) {}
```

Controller dùng `@Valid @RequestBody CreateDocumentRequest body`. Body `{"title":"   ","content":"x"}` vi phạm `@NotBlank`; body thiếu content vi phạm `@NotNull`. Các giới hạn này kiểm tra chuỗi theo cách của Java/validator, không phải số token mô hình.

Luồng lời giải:

1. Framework deserialize JSON thành DTO và validate.
2. Resolver lấy ID user từ principal đã xác thực; không dùng trường `ownerId` do client tự gửi.
3. Service chuẩn hóa title, lưu entity, trả DTO chỉ chứa dữ liệu được phép công bố.
4. Controller trả `ResponseEntity.created(URI.create("/documents/" + dto.id())).body(dto)`.

Lỗi thường gặp: bỏ `@Valid`; trả entity trực tiếp và vô tình lộ trường nội bộ; chỉ kiểm tra title ở giao diện client.

## P3.2 — Truy vấn đã giới hạn chủ sở hữu

Với entity `DocEntity` có thuộc tính Java `id`, `ownerId`, `createdAt`:

```java
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DocRepository extends JpaRepository<DocEntity, Long> {
    Optional<DocEntity> findByIdAndOwnerId(long id, long ownerId);
    Page<DocEntity> findAllByOwnerId(long ownerId, Pageable pageable);
}
```

Service gọi `repository.findByIdAndOwnerId(id, principalUserId).orElseThrow(NotFound::new)`. Phương thức derived query sử dụng tên thuộc tính entity. Nếu mô hình entity dùng quan hệ `owner.id`, phải điều chỉnh tên truy vấn tương ứng, ví dụ `findByIdAndOwner_Id`.

Kết quả mong đợi: user 1 đọc 101 thành công; user 2 nhận cùng lỗi NotFound như ID không tồn tại. Đây là lựa chọn hợp đồng để không tiết lộ sự tồn tại của tài nguyên. Xác thực user phải diễn ra trước service.

## P3.3 — Page và lỗi

```java
if (page < 0 || size < 1 || size > 100) {
    throw new IllegalArgumentException("invalid pagination");
}
var sort = org.springframework.data.domain.Sort
    .by(org.springframework.data.domain.Sort.Direction.DESC, "createdAt", "id");
var pageable = org.springframework.data.domain.PageRequest.of(page, size, sort);
var result = repository.findAllByOwnerId(principalUserId, pageable);
```

Trong `@RestControllerAdvice`, ánh xạ lỗi phân trang/validation thành 400 và `NotFound` thành 404; không gom mọi exception thành 200 hoặc 400. Lỗi lập trình và lỗi hạ tầng cần cách xử lý riêng.

Ví dụ response lỗi theo hợp đồng bài:

```json
{"code":"INVALID_PAGE","message":"page must be non-negative"}
```

Mã Java thuần nhân `(long) page * size` để tránh tràn số nguyên trước khi cắt danh sách. Với `[10,20,30]`, offset=2, end=3 → `[30]`. Page vượt cuối trả danh sách rỗng.

## P3.4 — Transaction

```java
@org.springframework.transaction.annotation.Transactional
public DocumentDto create(long userId, CreateDocumentRequest input) {
    var doc = documents.save(toEntity(userId, input));
    audits.save(newAudit(doc.getId(), "CREATED"));
    return toDto(doc);
}
```

`toEntity`, `newAudit`, `toDto` là các bước ánh xạ phải triển khai theo entity của dự án; đoạn này minh họa ranh giới transaction. Hai repository cần tham gia cùng transaction manager/database cho yêu cầu nguyên tử này.

Mặc định Spring rollback khi unchecked exception/`Error` đi ra khỏi phương thức transactional; checked exception cần cấu hình rollback nếu nghiệp vụ yêu cầu. Trong chế độ proxy thường dùng, tự gọi phương thức transactional từ cùng object không đi qua proxy như một lời gọi từ bean khác.

Kiểm chứng: gọi service qua Spring bean, làm thao tác audit thất bại, rồi đọc lại ở transaction khác và xác nhận không có tài liệu mới. Đặt unique marker cho fixture để truy vấn đúng bản ghi. Chỉ unit test một mock repository không chứng minh database đã rollback.

Nguồn: [Validation](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-validation.html), [Query methods](https://docs.spring.io/spring-data/jpa/reference/repositories/query-methods-details.html), [Rollback rules](https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/rolling-back.html).