package vn.roadmap.knowledge;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.*;
import static vn.roadmap.knowledge.ApiTypes.*;
@Service
public class DocumentService {
    private final DocumentRepository documents;private final AuditWriter audit;private final RetrievalGateway retrieval;
    public DocumentService(DocumentRepository documents,AuditWriter audit,RetrievalGateway retrieval){this.documents=documents;this.audit=audit;this.retrieval=retrieval;}
    private static String content(String s){if(s==null||s.length()>20000)throw new IllegalArgumentException("invalid content");return s;}
    @Transactional
    public DocumentView create(String owner,WriteDocument request){
        var d=documents.saveAndFlush(new DocumentEntity(owner,TextRules.title(request.title()),content(request.content())));
        audit.write(d.id,owner,"CREATED");return DocumentView.of(d);
    }
    @Transactional(readOnly=true)
    public DocumentEntity requireOwned(String owner,long id){return documents.findByIdAndOwnerId(id,owner).orElseThrow(AppErrors.Missing::new);}
    @Transactional(readOnly=true)
    public DocumentView get(String owner,long id){return DocumentView.of(requireOwned(owner,id));}
    @Transactional(readOnly=true)
    public DocumentPage list(String owner,int page,int size){
        if(page<0||size<1||size>100)throw new IllegalArgumentException("invalid pagination");
        // JPA offset is int; for this learning app, larger offsets return an empty page.
        if((long)page*size>Integer.MAX_VALUE)return new DocumentPage(java.util.List.of(),page,size,documents.findByOwnerId(owner,PageRequest.of(0,1)).getTotalElements());
        var result=documents.findByOwnerId(owner,PageRequest.of(page,size,Sort.by(Sort.Direction.DESC,"createdAt","id")));
        return new DocumentPage(result.getContent().stream().map(DocumentView::of).toList(),page,size,result.getTotalElements());
    }
    @Transactional
    public DocumentView update(String owner,long id,UpdateDocument request){
        var d=documents.lockOwned(id,owner).orElseThrow(AppErrors.Missing::new);
        if(request.expectedVersion()==null||request.expectedVersion()<0)throw new IllegalArgumentException("expectedVersion is required");
        if(d.version!=request.expectedVersion())throw new AppErrors.Stale();
        d.title=TextRules.title(request.title());d.content=content(request.content());
        retrieval.invalidate(id);documents.flush();audit.write(id,owner,"UPDATED");return DocumentView.of(d);
    }
    @Transactional
    public void delete(String owner,long id){
        var d=documents.lockOwned(id,owner).orElseThrow(AppErrors.Missing::new);
        retrieval.invalidate(id);documents.delete(d);audit.write(id,owner,"DELETED");
    }
}
