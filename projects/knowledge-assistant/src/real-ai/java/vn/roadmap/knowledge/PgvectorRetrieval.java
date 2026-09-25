package vn.roadmap.knowledge;

import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.jdbc.core.JdbcTemplate;
import java.util.*;
import static vn.roadmap.knowledge.ApiTypes.*;
@Component @Profile("real-ai")
public class PgvectorRetrieval implements RetrievalGateway {
    private final JdbcTemplate jdbc;private final EmbeddingModel embeddings;private final int dimensions;private final String model;private final double minimum;
    public PgvectorRetrieval(JdbcTemplate jdbc,EmbeddingModel embeddings,@Value("${app.embedding-dimensions}") int dimensions,@Value("${spring.ai.ollama.embedding.options.model}") String model,@Value("${app.min-similarity}") double minimum){
        if(dimensions<1||!Double.isFinite(minimum)||minimum< -1||minimum>1)throw new IllegalArgumentException("invalid vector configuration");
        this.jdbc=jdbc;this.embeddings=embeddings;this.dimensions=dimensions;this.model=model;this.minimum=minimum;
    }
    private String vector(String text){try{return TextRules.vector(embeddings.embed(text),dimensions);}catch(RuntimeException e){throw new AppErrors.Upstream("embedding failed",e);}}
    // Called inside KnowledgeService.index transaction with document row locked.
    public int index(DocumentEntity d){
        List<String> chunks=TextRules.chunks(d.content,70,10);List<String> vectors=new ArrayList<>();
        for(String c:chunks)vectors.add(vector(c));
        invalidate(d.id);
        for(int i=0;i<chunks.size();i++)jdbc.update("INSERT INTO document_chunk(id,document_id,document_version,owner_id,embedding_model,text,embedding) VALUES(?,?,?,?,?,?,CAST(? AS vector))",d.id+":"+d.version+":"+i,d.id,d.version,d.ownerId,model,chunks.get(i),vectors.get(i));
        return chunks.size();
    }
    public List<Source> retrieve(String owner,String question,int k){
        String v=vector(question);
        // Filter owner/model/dimensions/current document revision BEFORE exact top-k.
        String sql="""
            WITH eligible AS MATERIALIZED (
                SELECT c.id,c.document_id,c.document_version,d.title,c.text,c.embedding
                FROM document_chunk c JOIN document d ON d.id=c.document_id
                WHERE c.owner_id=? AND d.owner_id=? AND c.document_version=d.version
                  AND c.embedding_model=? AND vector_dims(c.embedding)=?
            )
            SELECT id,document_id,document_version,title,text,
                   1-(embedding <=> CAST(? AS vector)) AS score
            FROM eligible
            WHERE 1-(embedding <=> CAST(? AS vector))>=?
            ORDER BY score DESC,id ASC LIMIT ?
            """;
        return jdbc.query(sql,(rs,n)->new Source(rs.getString("id"),rs.getLong("document_id"),rs.getLong("document_version"),rs.getString("title"),rs.getString("text"),rs.getDouble("score")),owner,owner,model,dimensions,v,v,minimum,k);
    }

    public void invalidate(long id){jdbc.update("DELETE FROM document_chunk WHERE document_id=?",id);}
    public String mode(){return "pgvector-exact";}
}
