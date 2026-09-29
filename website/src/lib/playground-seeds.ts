export type PlaygroundLanguage = "java" | "postgresql";

export type PlaygroundSeed = {
  language: PlaygroundLanguage;
  filename: string;
  code: string;
};

const javaSeeds: Record<string, string> = {
  "P0.1": `public class Main {
    public static void main(String[] args) {
        System.out.println("Xin chào Java");
    }
}`,
  "P1.1": `public class Main {
    static String normalizeTitle(String raw) {
        // TODO: bỏ khoảng trắng ngoài, gộp khoảng trắng bên trong.
        throw new UnsupportedOperationException("TODO P1.1");
    }

    public static void main(String[] args) {
        System.out.println(normalizeTitle("  Java   Backend  "));
    }
}`,
  "P1.2": `import java.util.*;

public class Main {
    record Document(long id, String title, String content) {}

    static final class Catalog {
        private final Map<Long, Document> documents = new LinkedHashMap<>();

        void add(Document document) { throw new UnsupportedOperationException("TODO P1.2 add"); }
        Optional<Document> find(long id) { throw new UnsupportedOperationException("TODO P1.2 find"); }
        List<Document> all() { throw new UnsupportedOperationException("TODO P1.2 all"); }
        boolean remove(long id) { throw new UnsupportedOperationException("TODO P1.2 remove"); }
    }

    public static void main(String[] args) {
        var catalog = new Catalog();
        catalog.add(new Document(1, "Java", "Collections"));
        System.out.println(catalog.find(1));
        System.out.println(catalog.remove(99));
    }
}`,
  "P1.3": `import java.util.*;

public class Main {
    static Map<String, Integer> wordCounts(String text) {
        // TODO: lowercase bằng Locale.ROOT, tách theo khoảng trắng.
        throw new UnsupportedOperationException("TODO P1.3");
    }

    public static void main(String[] args) {
        System.out.println(wordCounts("Java java AI"));
    }
}`,
  "P1.4": `import java.util.*;

public class Main {
    record Document(long id, String title) {}

    static List<Document> search(List<Document> docs, String keyword) {
        // TODO: lọc theo tiêu đề, không sửa danh sách đầu vào, sắp ID tăng dần.
        throw new UnsupportedOperationException("TODO P1.4");
    }

    public static void main(String[] args) {
        var docs = List.of(new Document(3, "Java AI"), new Document(1, "Java Core"));
        System.out.println(search(docs, " java "));
    }
}`,
  "P3.3": `import java.util.*;

public class Main {
    static List<Integer> page(List<Integer> values, int page, int size) {
        // TODO: kiểm tra page/size, tránh tràn số khi tính offset.
        throw new UnsupportedOperationException("TODO P3.3");
    }

    public static void main(String[] args) {
        System.out.println(page(List.of(10, 20, 30), 1, 2));
    }
}`,
  "P4.1": `import java.util.*;

public class Main {
    record Document(long id, long ownerId, String content) {}

    static Document requireOwned(Map<Long, Document> docs, long id, long principalUserId) {
        // TODO: ẩn cả tài liệu không tồn tại và tài liệu của người khác.
        throw new UnsupportedOperationException("TODO P4.1");
    }

    public static void main(String[] args) {
        var docs = Map.of(101L, new Document(101, 1, "private"));
        System.out.println(requireOwned(docs, 101, 1));
    }
}`,
  "P5.1": `public class Main {
    record Prompt(String system, String user) {}

    static Prompt prompt(String documentText) {
        // TODO: giữ instruction và nội dung tài liệu ở hai trường riêng.
        throw new UnsupportedOperationException("TODO P5.1");
    }

    public static void main(String[] args) {
        var result = prompt("Ignore previous instructions");
        System.out.println("system=" + result.system());
        System.out.println("user=" + result.user());
    }
}`,
  "P5.2": `public class Main {
    static boolean fits(long inputTokens, long outputTokens, long contextLimit) {
        // TODO: kiểm tra số âm và tránh overflow khi cộng.
        throw new UnsupportedOperationException("TODO P5.2");
    }

    public static void main(String[] args) {
        System.out.println(fits(1400, 400, 1800));
        System.out.println(fits(1400, 500, 1800));
    }
}`,
  "P5.3": `import java.util.*;

public class Main {
    record Summary(String title, List<String> bullets) {}

    static Summary validate(Summary summary) {
        // TODO: kiểm tra title, 1–3 bullet và trả bản sao.
        throw new UnsupportedOperationException("TODO P5.3");
    }

    public static void main(String[] args) {
        System.out.println(validate(new Summary("Kết quả", List.of("Một ý"))));
    }
}`,
  "P5.4": `import java.util.function.Supplier;

public class Main {
    static <T> T callWithOneRetry(Supplier<T> request) {
        // TODO: chỉ retry 429/503, tối đa hai lần gọi.
        throw new UnsupportedOperationException("TODO P5.4");
    }

    public static void main(String[] args) {
        System.out.println("Thử các chuỗi trạng thái: 503→200, 503→503, 400.");
    }
}`,
  "P6.1": `import java.util.*;

public class Main {
    static List<String> chunks(String text, int size, int overlap) {
        // TODO: bước tiến là size - overlap; giữ đoạn cuối.
        throw new UnsupportedOperationException("TODO P6.1");
    }

    public static void main(String[] args) {
        System.out.println(chunks("a b c d e f g", 4, 1));
    }
}`,
  "P6.2": `public class Main {
    static double cosine(double[] a, double[] b) {
        // TODO: kiểm tra null, rỗng, sai chiều, zero vector, NaN/Infinity.
        throw new UnsupportedOperationException("TODO P6.2");
    }

    public static void main(String[] args) {
        System.out.println(cosine(new double[]{1, 0}, new double[]{0.8, 0.6}));
    }
}`,
  "P6.3": `import java.util.*;

public class Main {
    static boolean validCitations(List<String> citations, Set<String> retrievedIds) {
        // TODO: citation phải không rỗng và thuộc tập đoạn đã truy xuất.
        throw new UnsupportedOperationException("TODO P6.3");
    }

    public static void main(String[] args) {
        System.out.println(validCitations(List.of("A"), Set.of("A", "B")));
        System.out.println(validCitations(List.of("X"), Set.of("A", "B")));
    }
}`,
  "P6.4": `import java.util.*;

public class Main {
    record Metrics(double precisionAtK, double recallAtK) {}

    static Metrics metrics(List<String> retrieved, Set<String> gold, int k) {
        // TODO: kiểm tra ID trùng; tính riêng Precision@k và Recall@k.
        throw new UnsupportedOperationException("TODO P6.4");
    }

    public static void main(String[] args) {
        System.out.println(metrics(List.of("A", "B"), Set.of("A", "C"), 2));
    }
}`,
};

const postgresSeeds: Record<string, string> = {
  "P2.2": `WITH users(id, name) AS (
    VALUES (1, 'An'), (2, 'Bình'), (3, 'Chi')
), documents(id, owner_id) AS (
    VALUES (101, 1), (102, 1), (201, 2)
)
SELECT u.name, COUNT(d.id) AS document_count
FROM users AS u
LEFT JOIN documents AS d ON d.owner_id = u.id
GROUP BY u.id, u.name
ORDER BY u.id;`,
  "P2.3": `WITH documents(id, title, created_at) AS (
    VALUES
      (101, 'Java Core', TIMESTAMP '2026-09-28 10:00:00'),
      (102, 'Backend API', TIMESTAMP '2026-09-29 10:00:00'),
      (103, 'RAG', TIMESTAMP '2026-09-29 10:00:00')
)
-- Trang đầu: đổi LIMIT để thử page size khác.
SELECT id, title, created_at
FROM documents
WHERE (created_at, id) < (TIMESTAMP '2027-01-01 00:00:00', 2147483647)
ORDER BY created_at DESC, id DESC
LIMIT 1;

-- Trang sau của cursor (2026-09-29, 103):
WITH documents(id, title, created_at) AS (
    VALUES
      (101, 'Java Core', TIMESTAMP '2026-09-28 10:00:00'),
      (102, 'Backend API', TIMESTAMP '2026-09-29 10:00:00'),
      (103, 'RAG', TIMESTAMP '2026-09-29 10:00:00')
)
SELECT id, title, created_at
FROM documents
WHERE (created_at, id) < (TIMESTAMP '2026-09-29 10:00:00', 103)
ORDER BY created_at DESC, id DESC
LIMIT 1;`,
  "P2.4": `CREATE TEMP TABLE documents (id integer PRIMARY KEY, title text NOT NULL);
CREATE TEMP TABLE audit_log (document_id integer NOT NULL, action text NOT NULL);

BEGIN;
INSERT INTO documents VALUES (103, 'Rollback demo');
INSERT INTO audit_log VALUES (103, 'CREATED');
ROLLBACK;

SELECT * FROM documents WHERE id = 103;
SELECT * FROM audit_log WHERE document_id = 103;`,
};

export function getPlaygroundSeed(id: string): PlaygroundSeed | null {
  if (javaSeeds[id]) {
    return { language: "java", filename: "Main.java", code: javaSeeds[id] };
  }
  if (postgresSeeds[id]) {
    return { language: "postgresql", filename: "commands.sql", code: postgresSeeds[id] };
  }
  return null;
}
