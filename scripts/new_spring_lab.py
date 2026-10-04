# Copy the reference app to a NEW learning directory; never overwrite a prior attempt.
from pathlib import Path
import argparse,shutil
p=argparse.ArgumentParser();p.add_argument('--phase',choices=['3','4'],required=True);p.add_argument('--destination',required=True);a=p.parse_args()
r=Path(__file__).resolve().parents[1];dest=Path(a.destination).resolve();source=r/'projects/knowledge-assistant'
if dest.exists():p.error('Destination already exists. Choose a new directory to preserve your work.')
if source==dest or source in dest.parents:p.error('Choose a destination outside the reference app.')
shutil.copytree(source,dest,ignore=shutil.ignore_patterns('target','.env','.git','data'))
base=dest/'src/main/java/vn/roadmap/knowledge'
if a.phase=='3':
 f=base/'DocumentService.java';s=f.read_text(encoding='utf-8')
 s=s.replace('var d=documents.saveAndFlush(new DocumentEntity(owner,TextRules.title(request.title()),content(request.content())));','var d=unfinishedCreate(owner,request); // TODO P3.1')
 s=s.replace('return documents.findByIdAndOwnerId(id,owner).orElseThrow(AppErrors.Missing::new);','throw new UnsupportedOperationException("TODO P3.2");')
 s=s.replace('var result=documents.findByOwnerId(owner,PageRequest.of(page,size,Sort.by(Sort.Direction.DESC,"createdAt","id")));','var result=unfinishedPage(owner,page,size); // TODO P3.3')
 i=s.rfind('}');s=s[:i]+'''    private DocumentEntity unfinishedCreate(String owner,WriteDocument request){throw new UnsupportedOperationException("TODO P3.1");}
    private org.springframework.data.domain.Page<DocumentEntity> unfinishedPage(String owner,int page,int size){throw new UnsupportedOperationException("TODO P3.3");}
'''+s[i:]
 (dest/'src/main/resources/lab-fetch.jpql').write_text('select a from LabAuthor a order by a.id\n',encoding='utf-8')
 # P3.4: remove only create transaction so rollback test exposes the missing boundary.
 s=s.replace('    @Transactional\n    public DocumentView create','    // TODO P3.4: transaction boundary\n    public DocumentView create')
 f.write_text(s,encoding='utf-8')
else:
 (base/'RequestMetricsFilter.java').write_text('''package vn.roadmap.knowledge;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import java.io.IOException;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
@Component
public class RequestMetricsFilter extends OncePerRequestFilter {
    public record Snapshot(long requests,long errors,long totalNanos) {}
    public Snapshot snapshot(){return new Snapshot(0,0,0);}
    @Override protected void doFilterInternal(HttpServletRequest request,HttpServletResponse response,FilterChain chain)throws ServletException,IOException {
        // TODO O01: validated request ID, MDC cleanup and counters, including failures.
        chain.doFilter(request,response);
    }
}
''',encoding='utf-8')
 f=base/'SecurityConfig.java';s=f.read_text().replace('.anyRequest().authenticated()', '.anyRequest().permitAll() /* TODO P4.1 */');f.write_text(s)
 put=dest/'src/test/java/vn/roadmap/knowledge/OwnershipLearnerTest.java'
 put.write_text('''package vn.roadmap.knowledge;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
class OwnershipLearnerTest {
    @Test void rejectsOtherOwner(){fail("TODO P4.2: add an HTTP regression test for a second user");}
}
''')
 (dest/'Dockerfile').write_text('# TODO P4.3: multi-stage build, JRE 21, non-root user, runtime config\n')
 (dest/'LEARNER_CI.yml').write_text('# TODO P4.4: checkout, JDK 21, mvn test + integration verify + package; fail on errors\n')
(dest/'LEARNER.md').write_text('Read docs/EXERCISE_MAP.md in the roadmap root. Work only in this copy. Run mvn test here; phase 3 starts red. Compare with the reference app after your attempt.\n')
print('Created learning copy:',dest)
