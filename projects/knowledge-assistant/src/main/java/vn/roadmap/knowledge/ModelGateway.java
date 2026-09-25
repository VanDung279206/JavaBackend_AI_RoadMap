package vn.roadmap.knowledge;

import java.util.List;
import static vn.roadmap.knowledge.ApiTypes.*;
public interface ModelGateway {
    Summary summarize(DocumentEntity document);
    GeneratedAnswer answer(String question,List<Source> sources);
    String mode();
}
