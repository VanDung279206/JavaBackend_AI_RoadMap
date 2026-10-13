package vn.roadmap.knowledge;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoSpyBean;
import org.springframework.jdbc.core.JdbcTemplate;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/** SPRB03: no transaction on the test; inspect persisted state after the service proxy returns. */
@SpringBootTest @ActiveProfiles("demo")
class BridgeTransactionTest {
    @Autowired DocumentService service;
    @Autowired DocumentRepository documents;
    @Autowired JdbcTemplate jdbc;
    @MockitoSpyBean AuditWriter audit;

    @BeforeEach void clean() {
        jdbc.update("DELETE FROM audit_log");
        documents.deleteAll();
    }
    @Test void successCommitsDocumentAndAudit() {
        var result = service.create("an",new ApiTypes.WriteDocument("Commit","body"));
        assertEquals("an",documents.findById(result.id()).orElseThrow().ownerId);
        assertEquals(1L,documents.count());
        assertEquals(1L,jdbc.queryForObject("SELECT count(*) FROM audit_log WHERE document_id=? AND actor=? AND action=?",
            Long.class,result.id(),"an","CREATED"));
    }
    @Test void failureAfterAuditInsertRollsBackBothWrites() {
        // Insert a real audit row, THEN throw. Catching/swallowing the failure or saving
        // only the document in its repository transaction cannot satisfy this contract.
        doAnswer(invocation -> {
            invocation.callRealMethod();
            throw new IllegalStateException("audit failed after insert");
        }).when(audit).write(anyLong(),anyString(),anyString());
        assertThrows(IllegalStateException.class,() -> service.create("an",new ApiTypes.WriteDocument("Rollback","body")));
        verify(audit).write(anyLong(),eq("an"),eq("CREATED"));
        assertEquals(0L,documents.count(),"failed create must leave no document");
        assertEquals(0L,jdbc.queryForObject("SELECT count(*) FROM audit_log",Long.class),"failed create must leave no audit row");
    }
}
