package vn.roadmap.knowledge;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import java.time.OffsetDateTime;
@Component
public class AuditWriter {
    private final JdbcTemplate jdbc;
    public AuditWriter(JdbcTemplate jdbc){this.jdbc=jdbc;}
    public void write(long id,String actor,String action){jdbc.update("INSERT INTO audit_log(document_id,actor,action,created_at) VALUES(?,?,?,?)",id,actor,action,OffsetDateTime.now());}
}
