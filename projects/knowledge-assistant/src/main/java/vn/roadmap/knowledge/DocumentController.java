package vn.roadmap.knowledge;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.*;
import jakarta.validation.Valid;
import java.net.URI;
import java.security.Principal;
import static vn.roadmap.knowledge.ApiTypes.*;
@RestController
public class DocumentController {
    private final DocumentService documents;private final KnowledgeService knowledge;
    public DocumentController(DocumentService documents,KnowledgeService knowledge){this.documents=documents;this.knowledge=knowledge;}
    @GetMapping("/health") public java.util.Map<String,String> health(){return java.util.Map.of("status","UP");}
    @PostMapping("/documents") public ResponseEntity<DocumentView> create(Principal p,@Valid @RequestBody WriteDocument r){var d=documents.create(p.getName(),r);return ResponseEntity.created(URI.create("/documents/"+d.id())).body(d);}
    @GetMapping("/documents") public DocumentPage list(Principal p,@RequestParam(defaultValue="0") int page,@RequestParam(defaultValue="20") int size){return documents.list(p.getName(),page,size);}
    @GetMapping("/documents/{id}") public DocumentView get(Principal p,@PathVariable long id){return documents.get(p.getName(),id);}
    @PutMapping("/documents/{id}") public DocumentView update(Principal p,@PathVariable long id,@Valid @RequestBody UpdateDocument r){return documents.update(p.getName(),id,r);}
    @DeleteMapping("/documents/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void delete(Principal p,@PathVariable long id){documents.delete(p.getName(),id);}
    @PostMapping("/documents/{id}/summary") public SummaryResponse summary(Principal p,@PathVariable long id){return knowledge.summarize(p.getName(),id);}
    @PostMapping("/documents/{id}/index") public IndexResponse index(Principal p,@PathVariable long id){return knowledge.index(p.getName(),id);}
    @PostMapping("/questions") public AnswerResponse ask(Principal p,@Valid @RequestBody Question q){return knowledge.ask(p.getName(),q);}
}
