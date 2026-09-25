package vn.roadmap.knowledge;

import org.junit.jupiter.api.Test;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import static vn.roadmap.knowledge.ApiTypes.*;
class KnowledgeServiceTest {
    @Test void missingContextSkipsGeneration(){
        var m=mock(ModelGateway.class);var r=mock(RetrievalGateway.class);when(r.retrieve("an","q",2)).thenReturn(List.of());
        var service=new KnowledgeService(mock(DocumentService.class),mock(DocumentRepository.class),m,r);
        assertEquals("INSUFFICIENT_CONTEXT",service.ask("an",new Question("q",2)).status());verify(m,never()).answer(anyString(),anyList());
    }
    @Test void fabricatedCitationRejected(){
        var m=mock(ModelGateway.class);var r=mock(RetrievalGateway.class);var sources=List.of(new Source("A",1,0,"t","x",1));
        when(r.retrieve("an","q",1)).thenReturn(sources);when(m.answer("q",sources)).thenReturn(new GeneratedAnswer("answer",List.of("X"),false));
        var service=new KnowledgeService(mock(DocumentService.class),mock(DocumentRepository.class),m,r);
        assertThrows(AppErrors.Upstream.class,()->service.ask("an",new Question("q",1)));
    }
}
