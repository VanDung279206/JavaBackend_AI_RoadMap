package vn.roadmap.knowledge;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.*;
import org.springframework.jdbc.core.JdbcTemplate;
import static org.junit.jupiter.api.Assertions.*;
@SpringBootTest(properties={"app.an-password=integration-an","app.binh-password=integration-binh"})
@ActiveProfiles("postgres") @Testcontainers
class PostgresIT {
    @Container static final PostgreSQLContainer<?> POSTGRES=new PostgreSQLContainer<>("postgres:17");
    @DynamicPropertySource static void database(DynamicPropertyRegistry r){r.add("spring.datasource.url",POSTGRES::getJdbcUrl);r.add("spring.datasource.username",POSTGRES::getUsername);r.add("spring.datasource.password",POSTGRES::getPassword);}
    @Autowired DocumentService service;@Autowired JdbcTemplate jdbc;
    @Test void persistenceAndOwnership(){
        var d=service.create("an",new ApiTypes.WriteDocument("PostgreSQL","persistent"));
        assertEquals("persistent",service.get("an",d.id()).content());
        assertThrows(AppErrors.Missing.class,()->service.get("binh",d.id()));
        assertEquals(1L,jdbc.queryForObject("SELECT COUNT(*) FROM audit_log WHERE document_id=?",Long.class,d.id()));
        service.delete("an",d.id());assertThrows(AppErrors.Missing.class,()->service.get("an",d.id()));
    }
}
