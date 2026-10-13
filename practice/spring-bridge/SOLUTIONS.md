# Đối chiếu sau khi thử ba bài Spring

## SPRB01 — Điền validation trên DTO

```java
public record WriteDocument(
    @NotBlank @Size(max=120) String title,
    @NotNull @Size(max=20000) String content
) {}
```

NotBlank bao gồm null/trắng; NotNull giữ content rỗng hợp lệ. Size tự nó không từ chối null, nên cần constraint bắt buộc riêng. Đối chiếu [ApiTypes](../../projects/knowledge-assistant/src/main/java/vn/roadmap/knowledge/ApiTypes.java).

“NotBlank rejects missing or blank titles. NotNull permits empty content but rejects null.”

## SPRB02 — Nối service với repository theo owner

```java
@Transactional(readOnly=true)
public DocumentEntity requireOwned(String owner,long id) {
    return documents.findByIdAndOwnerId(id,owner).orElseThrow(AppErrors.Missing::new);
}
```

ID chưa có và ID ngoài owner cùng trả Missing; không tiết lộ tài liệu của người khác. Đối chiếu [DocumentService](../../projects/knowledge-assistant/src/main/java/vn/roadmap/knowledge/DocumentService.java).

“The repository lookup includes both ID and owner. An unmatched row raises the same missing-document error.”

## SPRB03 — Một transaction cho document và audit

```java
@Transactional
public DocumentView create(String owner,WriteDocument request) {
    var d=documents.saveAndFlush(new DocumentEntity(owner,TextRules.title(request.title()),content(request.content())));
    audit.write(d.id,owner,"CREATED");
    return DocumentView.of(d);
}
```

Gọi từ bên ngoài bean qua Spring proxy để transaction bao cả hai bước. Runtime exception truyền ra khiến rollback; flush gửi INSERT tới database nhưng chưa commit transaction ngoài. Đối chiếu [DocumentService](../../projects/knowledge-assistant/src/main/java/vn/roadmap/knowledge/DocumentService.java).

“Both writes belong to the service transaction. A runtime audit failure rolls them back. Flushing does not commit.”
