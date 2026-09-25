import java.util.*;
import java.util.stream.Collectors;

/** Solutions for P1.1-P1.4. In-memory, single-threaded learning model. */
public final class JavaCoreLab {
    public record Document(long id, String title, String content) {
        public Document {
            if (id <= 0) throw new IllegalArgumentException("id must be positive");
            title = normalizeTitle(title);
            content = Objects.requireNonNull(content, "content");
        }
    }

    // P1.1: ASCII whitespace plus Java String.strip behavior; no Unicode normalization.
    public static String normalizeTitle(String raw) {
        if (raw == null) throw new IllegalArgumentException("title is required");
        String result = raw.strip().replaceAll("\\s+", " ");
        if (result.isEmpty()) throw new IllegalArgumentException("title is blank");
        return result;
    }

    // P1.2: unique IDs; an existing ID must not be overwritten silently.
    public static final class Catalog {
        private final Map<Long, Document> documents = new LinkedHashMap<>();
        public void add(Document document) {
            Objects.requireNonNull(document, "document");
            if (documents.putIfAbsent(document.id(), document) != null)
                throw new IllegalArgumentException("duplicate id");
        }
        public Optional<Document> find(long id) {
            return Optional.ofNullable(documents.get(id));
        }
        public List<Document> all() { return List.copyOf(documents.values()); }
        public boolean remove(long id) { return documents.remove(id) != null; }
    }

    // P1.3: lowercase whitespace-delimited tokens; punctuation is preserved deliberately.
    public static Map<String, Integer> wordCounts(String text) {
        Objects.requireNonNull(text, "text");
        Map<String, Integer> counts = new TreeMap<>();
        if (text.isBlank()) return counts;
        for (String word : text.strip().toLowerCase(Locale.ROOT).split("\\s+"))
            counts.merge(word, 1, Integer::sum);
        return counts;
    }

    // P1.4: case-insensitive search; ascending ID breaks ordering ambiguity.
    public static List<Document> search(List<Document> docs, String keyword) {
        Objects.requireNonNull(docs, "docs");
        if (keyword == null || keyword.isBlank())
            throw new IllegalArgumentException("keyword is required");
        String key = keyword.strip().toLowerCase(Locale.ROOT);
        return docs.stream()
            .filter(d -> d.title().toLowerCase(Locale.ROOT).contains(key))
            .sorted(Comparator.comparingLong(Document::id))
            .collect(Collectors.toUnmodifiableList());
    }
}