package vn.roadmap.knowledge;

import java.util.List;
import static vn.roadmap.knowledge.ApiTypes.*;
public interface RetrievalGateway {
    List<Source> retrieve(String owner,String question,int k);
    int index(DocumentEntity document);
    void invalidate(long documentId);
    String mode();
}
