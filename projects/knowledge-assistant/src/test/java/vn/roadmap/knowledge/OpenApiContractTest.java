package vn.roadmap.knowledge;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.web.bind.annotation.*;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;

/** Detect route/DTO drift; this is not a full JSON Schema conformance validator. */
class OpenApiContractTest {
    @Test void everyControllerRouteAndPublicDtoIsDocumented() throws Exception {
        try (var input = getClass().getResourceAsStream("/static/openapi.json")) {
            assertNotNull(input);
            var api = new ObjectMapper().readTree(input);
            Set<String> actual = new HashSet<>(), documented = new HashSet<>();
            api.get("paths").fields().forEachRemaining(path -> path.getValue().fieldNames()
                .forEachRemaining(method -> documented.add(method.toUpperCase()+" "+path.getKey())));
            for (var method : DocumentController.class.getDeclaredMethods()) {
                for (var annotation : method.getAnnotations()) {
                    if (annotation instanceof GetMapping a) for(var path:a.value()) actual.add("GET "+path);
                    if (annotation instanceof PostMapping a) for(var path:a.value()) actual.add("POST "+path);
                    if (annotation instanceof PutMapping a) for(var path:a.value()) actual.add("PUT "+path);
                    if (annotation instanceof DeleteMapping a) for(var path:a.value()) actual.add("DELETE "+path);
                }
            }
            assertEquals(actual,documented,"OpenAPI route drift");
            for (var type : List.of(ApiTypes.WriteDocument.class,ApiTypes.UpdateDocument.class,
                ApiTypes.DocumentView.class,ApiTypes.DocumentPage.class,ApiTypes.Question.class,
                ApiTypes.Summary.class,ApiTypes.SummaryResponse.class,ApiTypes.Source.class,
                ApiTypes.AnswerResponse.class,ApiTypes.IndexResponse.class)) {
                Set<String> fields = new HashSet<>(), properties = new HashSet<>();
                for(var field:type.getRecordComponents()) fields.add(field.getName());
                api.path("components").path("schemas").path(type.getSimpleName()).path("properties")
                    .fieldNames().forEachRemaining(properties::add);
                assertEquals(fields,properties,type.getSimpleName()+" contract drift");
            }
        }
    }
}
