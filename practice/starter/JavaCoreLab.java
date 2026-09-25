import java.util.*;
public final class JavaCoreLab {
    public record Document(long id, String title, String content) {
        public Document {
            if (id <= 0) throw new IllegalArgumentException("id must be positive");
            title = normalizeTitle(title);
            content = Objects.requireNonNull(content);
        }
    }
    public static String normalizeTitle(String raw) {
        throw new UnsupportedOperationException("TODO P1.1");
    }
    public static final class Catalog {
        private final Map<Long, Document> documents = new LinkedHashMap<>();
        public void add(Document d) { throw new UnsupportedOperationException("TODO P1.2"); }
        public Optional<Document> find(long id) { throw new UnsupportedOperationException("TODO P1.2"); }
        public List<Document> all() { throw new UnsupportedOperationException("TODO P1.2"); }
        public boolean remove(long id) { throw new UnsupportedOperationException("TODO P1.2"); }
    }
    public static Map<String,Integer> wordCounts(String text) {
        throw new UnsupportedOperationException("TODO P1.3");
    }
    public static List<Document> search(List<Document> docs, String keyword) {
        throw new UnsupportedOperationException("TODO P1.4");
    }
}
