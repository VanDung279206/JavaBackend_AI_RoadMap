package vn.roadmap.knowledge;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import java.util.Map;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.httpBasic;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/** Individual phase-3 contracts, selected by the catalogue in the learner copy. */
@SpringBootTest @AutoConfigureMockMvc @ActiveProfiles("demo")
class LearningContractTest {
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;
    @Autowired DocumentRepository documents;
    @BeforeEach void clean() { documents.deleteAll(); }

    private long create(String title) throws Exception {
        var response = mvc.perform(post("/documents").with(httpBasic("an","an-demo-only"))
            .contentType("application/json").content(json.writeValueAsString(Map.of("title",title,"content","body"))))
            .andExpect(status().isCreated()).andExpect(header().exists("Location"))
            .andExpect(jsonPath("$.title").value(title)).andReturn().getResponse();
        return json.readTree(response.getContentAsString()).get("id").asLong();
    }

    @Test void createsValidatedOwnedDocument() throws Exception {
        long id = create("Java Notes");
        var persisted = documents.findById(id).orElseThrow();
        assertEquals("an",persisted.ownerId);
        assertEquals("body",persisted.content);
        mvc.perform(post("/documents").with(httpBasic("an","an-demo-only"))
            .contentType("application/json").content("{\"title\":\" \",\"content\":\"x\"}"))
            .andExpect(status().isBadRequest());
        assertEquals(1,documents.count(),"invalid create must not persist a row");
    }

    @Test void findsOnlyOwnedDocument() throws Exception {
        long id = create("Private Notes");
        mvc.perform(get("/documents/"+id).with(httpBasic("an","an-demo-only")))
            .andExpect(status().isOk()).andExpect(jsonPath("$.id").value(id));
        mvc.perform(get("/documents/"+id).with(httpBasic("binh","binh-demo-only")))
            .andExpect(status().isNotFound());
        mvc.perform(get("/documents/"+Long.MAX_VALUE).with(httpBasic("an","an-demo-only")))
            .andExpect(status().isNotFound());
    }

    @Test void listsStableOwnedPages() throws Exception {
        long first = create("First");
        create("Second");
        mvc.perform(get("/documents?page=1&size=1").with(httpBasic("an","an-demo-only")))
            .andExpect(status().isOk()).andExpect(jsonPath("$.items.length()").value(1))
            .andExpect(jsonPath("$.items[0].id").value(first)).andExpect(jsonPath("$.totalElements").value(2));
        mvc.perform(get("/documents").with(httpBasic("binh","binh-demo-only")))
            .andExpect(status().isOk()).andExpect(jsonPath("$.items").isEmpty())
            .andExpect(jsonPath("$.totalElements").value(0));
        mvc.perform(get("/documents?page=-1").with(httpBasic("an","an-demo-only")))
            .andExpect(status().isBadRequest());
    }
}
