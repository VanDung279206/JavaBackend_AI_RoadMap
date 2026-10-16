package vn.roadmap.knowledge;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import static org.junit.jupiter.api.Assertions.*;

/** SPRB02: the service uses a real JPA repository and H2 database, not an in-memory Map. */
@SpringBootTest @ActiveProfiles("demo")
class BridgeRepositoryTest {
    @Autowired DocumentService service;
    @Autowired DocumentRepository documents;

    @Test void lookupRequiresBothIdAndOwner() {
        var an = documents.saveAndFlush(new DocumentEntity("an","An notes","body"));
        var binh = documents.saveAndFlush(new DocumentEntity("binh","Binh notes","private"));
        var later = documents.saveAndFlush(new DocumentEntity("an","Later notes","second body"));
        try {
            var found = service.requireOwned("an",an.id);
            assertEquals(an.id,found.id);
            assertEquals("an",found.ownerId);
            assertEquals("body",found.content);
            var second = service.requireOwned("an",later.id);
            assertEquals(later.id,second.id,"lookup must return the requested row, not another document from this owner");
            assertEquals("Later notes",second.title);
            assertEquals("second body",second.content);
            assertEquals(binh.id,service.requireOwned("binh",binh.id).id);
            assertThrows(AppErrors.Missing.class,() -> service.requireOwned("binh",an.id));
            assertThrows(AppErrors.Missing.class,() -> service.requireOwned("an",binh.id));
            assertThrows(AppErrors.Missing.class,() -> service.requireOwned("an",Long.MAX_VALUE));
            assertThrows(AppErrors.Missing.class,() -> service.requireOwned("an",-1));
            assertEquals("private",documents.findById(binh.id).orElseThrow().content,"lookup must not mutate rows");
        } finally {
            documents.deleteById(an.id);
            documents.deleteById(binh.id);
            documents.deleteById(later.id);
        }
    }
}
