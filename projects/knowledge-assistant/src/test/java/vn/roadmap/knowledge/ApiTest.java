package vn.roadmap.knowledge;

import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Map;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.httpBasic;
@SpringBootTest @AutoConfigureMockMvc @ActiveProfiles("demo")
class ApiTest {
    @Autowired MockMvc mvc;@Autowired ObjectMapper json;@Autowired DocumentRepository documents;
    @BeforeEach void clean(){documents.deleteAll();}
    long create(String content)throws Exception{
        String body=json.writeValueAsString(Map.of("title","Java Notes","content",content));
        String result=mvc.perform(post("/documents").with(httpBasic("an","an-demo-only")).contentType("application/json").content(body))
            .andExpect(status().isCreated()).andExpect(header().exists("Location")).andReturn().getResponse().getContentAsString();
        return json.readTree(result).get("id").asLong();
    }
    @Test void anonymousCannotRead()throws Exception{mvc.perform(get("/documents")).andExpect(status().isUnauthorized());}
    @Test void wrongPasswordCannotRead()throws Exception{mvc.perform(get("/documents").with(httpBasic("an","wrong"))).andExpect(status().isUnauthorized());}
    @Test void titleAndOwnerAreValidated()throws Exception{
        mvc.perform(post("/documents").with(httpBasic("an","an-demo-only")).contentType("application/json").content("{\"title\":\" \",\"content\":\"x\"}")).andExpect(status().isBadRequest());
        mvc.perform(post("/documents").with(httpBasic("an","an-demo-only")).contentType("application/json").content("{\"title\":\"A\",\"content\":\"x\",\"ownerId\":\"binh\"}")).andExpect(status().isBadRequest());
    }
    @Test void ownerIsolationForReadWriteSummaryAndIndex()throws Exception{
        long id=create("Java uses classes");
        mvc.perform(get("/documents/"+id).with(httpBasic("binh","binh-demo-only"))).andExpect(status().isNotFound());
        mvc.perform(put("/documents/"+id).with(httpBasic("binh","binh-demo-only")).contentType("application/json").content("{\"title\":\"Hacked\",\"content\":\"x\",\"expectedVersion\":0}")).andExpect(status().isNotFound());
        mvc.perform(delete("/documents/"+id).with(httpBasic("binh","binh-demo-only"))).andExpect(status().isNotFound());
        mvc.perform(post("/documents/"+id+"/summary").with(httpBasic("binh","binh-demo-only"))).andExpect(status().isNotFound());
        mvc.perform(post("/documents/"+id+"/index").with(httpBasic("binh","binh-demo-only"))).andExpect(status().isNotFound());
        mvc.perform(get("/documents/"+id).with(httpBasic("an","an-demo-only"))).andExpect(status().isOk()).andExpect(jsonPath("$.title").value("Java Notes"));
    }
    @Test void paginationAndUpdateDelete()throws Exception{
        long id=create("old");
        mvc.perform(get("/documents?page=-1").with(httpBasic("an","an-demo-only"))).andExpect(status().isBadRequest());
        mvc.perform(get("/documents?page=2147483647&size=100").with(httpBasic("an","an-demo-only"))).andExpect(status().isOk()).andExpect(jsonPath("$.items").isEmpty());
        mvc.perform(put("/documents/"+id).with(httpBasic("an","an-demo-only")).contentType("application/json").content("{\"title\":\"Updated\",\"content\":\"new\",\"expectedVersion\":0}")).andExpect(status().isOk()).andExpect(jsonPath("$.title").value("Updated"));
        mvc.perform(delete("/documents/"+id).with(httpBasic("an","an-demo-only"))).andExpect(status().isNoContent());
        mvc.perform(get("/documents/"+id).with(httpBasic("an","an-demo-only"))).andExpect(status().isNotFound());
    }
    @Test void summaryAndQuestionUseOwnSources()throws Exception{
        long id=create("Java uses classes.");
        mvc.perform(post("/documents/"+id+"/summary").with(httpBasic("an","an-demo-only"))).andExpect(status().isOk()).andExpect(jsonPath("$.mode").value("extractive-demo"));
        mvc.perform(post("/questions").with(httpBasic("an","an-demo-only")).contentType("application/json").content("{\"question\":\"Java\",\"k\":2}"))
            .andExpect(status().isOk()).andExpect(jsonPath("$.status").value("ANSWERED")).andExpect(jsonPath("$.sources[0].documentId").value(id));
        mvc.perform(post("/questions").with(httpBasic("binh","binh-demo-only")).contentType("application/json").content("{\"question\":\"Java\",\"k\":2}"))
            .andExpect(status().isOk()).andExpect(jsonPath("$.status").value("INSUFFICIENT_CONTEXT")).andExpect(jsonPath("$.sources").isEmpty());
    }
    @Test void emptySummaryRejected()throws Exception{
        long id=create("");mvc.perform(post("/documents/"+id+"/summary").with(httpBasic("an","an-demo-only"))).andExpect(status().isBadRequest());
    }
    @Test void staleWriteIsRejectedAndVersionIsRequired()throws Exception {
        long id=create("old");
        String first=json.writeValueAsString(Map.of("title","First","content","saved","expectedVersion",0));
        mvc.perform(put("/documents/"+id).with(httpBasic("an","an-demo-only")).contentType("application/json").content(first))
            .andExpect(status().isOk()).andExpect(jsonPath("$.version").value(1));
        String stale=json.writeValueAsString(Map.of("title","Stale","content","lost update","expectedVersion",0));
        mvc.perform(put("/documents/"+id).with(httpBasic("an","an-demo-only")).contentType("application/json").content(stale)).andExpect(status().isConflict());
        mvc.perform(get("/documents/"+id).with(httpBasic("an","an-demo-only"))).andExpect(status().isOk()).andExpect(jsonPath("$.title").value("First"));
        String missing=json.writeValueAsString(Map.of("title","Missing version","content","x"));
        mvc.perform(put("/documents/"+id).with(httpBasic("an","an-demo-only")).contentType("application/json").content(missing)).andExpect(status().isBadRequest());
    }
}
