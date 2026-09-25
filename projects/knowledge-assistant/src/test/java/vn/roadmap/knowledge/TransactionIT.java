package vn.roadmap.knowledge;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
@SpringBootTest(properties={"app.an-password=integration-an","app.binh-password=integration-binh"})
@ActiveProfiles("postgres") @Testcontainers
class TransactionIT {
    @Container static final PostgreSQLContainer<?> POSTGRES=new PostgreSQLContainer<>("postgres:17");
    @DynamicPropertySource static void database(DynamicPropertyRegistry r){r.add("spring.datasource.url",POSTGRES::getJdbcUrl);r.add("spring.datasource.username",POSTGRES::getUsername);r.add("spring.datasource.password",POSTGRES::getPassword);}
    @Autowired DocumentService service;@Autowired DocumentRepository documents;@MockitoBean AuditWriter audit;
    @Test void postgresRollbackOnAuditFailure(){
        long before=documents.count();doThrow(new IllegalStateException("audit unavailable")).when(audit).write(anyLong(),anyString(),anyString());
        assertThrows(IllegalStateException.class,()->service.create("an",new ApiTypes.WriteDocument("Rollback","x")));
        assertEquals(before,documents.count());
    }
}
