package vn.roadmap.knowledge;

import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.data.domain.*;
import java.util.*;
import static vn.roadmap.knowledge.ApiTypes.*;
@Component @Profile("!real-ai")
public class DemoRetrieval implements RetrievalGateway {
    private final DocumentRepository documents;
    public DemoRetrieval(DocumentRepository documents){this.documents=documents;}
    public List<Source> retrieve(String owner,String question,int k){
        var page=documents.findByOwnerId(owner,PageRequest.of(0,200,Sort.by("id")));
        if(page.getTotalElements()>200)throw new IllegalArgumentException("demo corpus limit: 200 documents per user");
        List<Source> hits=new ArrayList<>();
        for(var d:page.getContent()){
            var chunks=TextRules.chunks(d.content,70,10);
            for(int i=0;i<chunks.size();i++){
                String text=chunks.get(i);double score=TextRules.lexicalScore(question,text);
                if(score>0)hits.add(new Source(d.id+":"+d.version+":"+i,d.id,d.version,d.title,text,score));
            }
        }
        return hits.stream().sorted(Comparator.comparingDouble(Source::score).reversed().thenComparing(Source::id)).limit(k).toList();
    }
    public int index(DocumentEntity d){return TextRules.chunks(d.content,70,10).size();}
    public void invalidate(long id){}
    public String mode(){return "lexical-demo";}
}
