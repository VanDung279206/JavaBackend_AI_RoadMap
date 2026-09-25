package vn.roadmap.knowledge;

import java.util.concurrent.*;
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
class ConcurrentIT {
    @Container static final PostgreSQLContainer<?> POSTGRES=new PostgreSQLContainer<>("postgres:17");
    @DynamicPropertySource static void database(DynamicPropertyRegistry r){r.add("spring.datasource.url",POSTGRES::getJdbcUrl);r.add("spring.datasource.username",POSTGRES::getUsername);r.add("spring.datasource.password",POSTGRES::getPassword);}
    @Autowired DocumentService service;@Autowired JdbcTemplate jdbc;
    @Test void onlyOneRequestCanUpdateTheVersionReadByBothClients()throws Exception {
        var document=service.create("an",new ApiTypes.WriteDocument("Concurrent","before"));
        var executor=Executors.newFixedThreadPool(2);var ready=new CountDownLatch(2);var start=new CountDownLatch(1);
        Callable<Boolean> request=()->{ready.countDown();if(!start.await(5,TimeUnit.SECONDS))throw new IllegalStateException("barrier timeout");
            try{service.update("an",document.id(),new ApiTypes.UpdateDocument("Changed",Thread.currentThread().getName(),document.version()));return true;}
            catch(AppErrors.Stale expected){return false;}};
        try {
            Future<Boolean> first=executor.submit(request),second=executor.submit(request);
            assertTrue(ready.await(5,TimeUnit.SECONDS));start.countDown();
            int successes=(first.get(15,TimeUnit.SECONDS)?1:0)+(second.get(15,TimeUnit.SECONDS)?1:0);
            assertEquals(1,successes);assertEquals(document.version()+1,service.get("an",document.id()).version());
            assertEquals(1L,jdbc.queryForObject("SELECT COUNT(*) FROM audit_log WHERE document_id=? AND action='UPDATED'",Long.class,document.id()));
            assertThrows(AppErrors.Missing.class,()->service.update("binh",document.id(),new ApiTypes.UpdateDocument("Other","x",document.version())));
        } finally {
            start.countDown();executor.shutdownNow();assertTrue(executor.awaitTermination(5,TimeUnit.SECONDS));service.delete("an",document.id());
        }
    }
}
