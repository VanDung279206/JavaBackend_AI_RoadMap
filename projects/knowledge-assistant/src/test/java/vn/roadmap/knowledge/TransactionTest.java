package vn.roadmap.knowledge;

import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
@SpringBootTest @ActiveProfiles("demo")
class TransactionTest {
    @Autowired DocumentService service;@Autowired DocumentRepository documents;
    @MockitoBean AuditWriter audit;
    @Test void auditFailureRollsBackDocument(){
        long before=documents.count();doThrow(new IllegalStateException("audit unavailable")).when(audit).write(anyLong(),anyString(),anyString());
        assertThrows(IllegalStateException.class,()->service.create("an",new ApiTypes.WriteDocument("Tx","x")));
        assertEquals(before,documents.count());
    }
}
