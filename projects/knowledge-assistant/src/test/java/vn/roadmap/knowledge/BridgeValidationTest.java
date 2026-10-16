package vn.roadmap.knowledge;

import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.Test;
import java.util.Set;
import java.util.stream.Collectors;
import static org.junit.jupiter.api.Assertions.*;

/** SPRB01: validate the DTO directly, independently of service and DB constraints. */
class BridgeValidationTest {
    @Test void acceptsBoundariesAndRejectsInvalidFields() {
        try (ValidatorFactory factory = Validation.buildDefaultValidatorFactory()) {
            Validator validator = factory.getValidator();
            for (String title : new String[]{"Java", "x".repeat(120)}) {
                for (String content : new String[]{"", "x".repeat(20000)}) {
                    assertTrue(validator.validate(new ApiTypes.WriteDocument(title,content)).isEmpty(),
                        "title up to 120 and content up to 20000, including empty content, are valid");
                }
            }
            for (String title : new String[]{null, "", " \t\n", "x".repeat(121)}) {
                assertEquals(Set.of("title"), fields(validator,new ApiTypes.WriteDocument(title,"body")),
                    "invalid title must fail DTO validation");
            }
            for (String content : new String[]{null, "x".repeat(20001)}) {
                assertEquals(Set.of("content"), fields(validator,new ApiTypes.WriteDocument("Java",content)),
                    "invalid content must fail DTO validation");
            }
            assertEquals(Set.of("title","content"),fields(validator,new ApiTypes.WriteDocument(null,null)));
        }
    }
    private Set<String> fields(Validator validator,ApiTypes.WriteDocument request) {
        return validator.validate(request).stream().map(v -> v.getPropertyPath().toString()).collect(Collectors.toSet());
    }
}
