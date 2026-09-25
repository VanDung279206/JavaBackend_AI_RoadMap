package vn.roadmap.knowledge;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;
import static vn.roadmap.knowledge.ApiTypes.*;
@Service
public class KnowledgeService {
    private final DocumentService documents;private final DocumentRepository repository;
    private final ModelGateway model;private final RetrievalGateway retrieval;
    public KnowledgeService(DocumentService documents,DocumentRepository repository,ModelGateway model,RetrievalGateway retrieval){this.documents=documents;this.repository=repository;this.model=model;this.retrieval=retrieval;}
    public SummaryResponse summarize(String owner,long id){
        var d=documents.requireOwned(owner,id);if(d.content.isBlank())throw new IllegalArgumentException("document is blank");
        var s=model.summarize(d);
        if(s==null||s.title()==null||s.title().isBlank()||s.bullets()==null||s.bullets().isEmpty()||s.bullets().size()>3||s.bullets().stream().anyMatch(x->x==null||x.isBlank()))throw new AppErrors.Upstream("invalid summary structure");
        return new SummaryResponse(model.mode(),new Summary(s.title().strip(),List.copyOf(s.bullets())));
    }
    @Transactional
    public IndexResponse index(String owner,long id){
        var d=repository.lockOwned(id,owner).orElseThrow(AppErrors.Missing::new);
        return new IndexResponse(id,retrieval.index(d),retrieval.mode());
    }
    public AnswerResponse ask(String owner,Question request){
        if(request.question()==null||request.question().isBlank()||request.k()<1||request.k()>5)throw new IllegalArgumentException("invalid question");
        var hits=retrieval.retrieve(owner,request.question(),request.k());
        if(hits.isEmpty())return insufficient();
        var answer=model.answer(request.question(),hits);
        if(answer==null)throw new AppErrors.Upstream("missing model response");
        if(answer.insufficient())return insufficient();
        var allowed=new HashSet<String>();for(var h:hits)allowed.add(h.id());
        if(answer.answer()==null||answer.answer().isBlank()||!TextRules.citationsAllowed(answer.citationIds(),allowed))throw new AppErrors.Upstream("invalid answer or citation IDs");
        var cited=new HashSet<>(answer.citationIds());
        return new AnswerResponse(model.mode(),"ANSWERED",answer.answer(),hits.stream().filter(s->cited.contains(s.id())).toList());
    }
    private AnswerResponse insufficient(){return new AnswerResponse(model.mode(),"INSUFFICIENT_CONTEXT","Không đủ dữ liệu trong các tài liệu được phép truy cập.",List.of());}
}
