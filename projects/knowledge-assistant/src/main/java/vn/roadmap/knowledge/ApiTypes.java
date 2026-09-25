package vn.roadmap.knowledge;

import jakarta.validation.constraints.*;
import java.time.Instant;
import java.util.List;
public final class ApiTypes {
    private ApiTypes() {}
    public record WriteDocument(@NotBlank @Size(max=120) String title,@NotNull @Size(max=20000) String content) {}
    public record UpdateDocument(@NotBlank @Size(max=120) String title,@NotNull @Size(max=20000) String content,@NotNull @PositiveOrZero Long expectedVersion) {}
    public record DocumentView(long id,String title,String content,Instant createdAt,long version) {
        static DocumentView of(DocumentEntity d){return new DocumentView(d.id,d.title,d.content,d.createdAt,d.version);}
    }
    public record DocumentPage(List<DocumentView> items,int page,int size,long totalElements) {}
    public record Question(@NotBlank @Size(max=500) String question,@Min(1) @Max(5) int k) {}
    public record Summary(String title,List<String> bullets) {}
    public record SummaryResponse(String mode,Summary summary) {}
    public record Source(String id,long documentId,long version,String title,String text,double score) {}
    public record GeneratedAnswer(String answer,List<String> citationIds,boolean insufficient) {}
    public record AnswerResponse(String mode,String status,String answer,List<Source> sources) {}
    public record IndexResponse(long documentId,int chunks,String mode) {}
}
