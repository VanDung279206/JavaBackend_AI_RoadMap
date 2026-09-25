import java.util.*;

/** Synthetic vectors and text fixtures, not a real embedding model. */
public final class RagLab {
    public record Chunk(String id, long ownerId, String text, double[] vector) {}
    public record Hit(Chunk chunk, double score) {}
    public record Metrics(double precisionAtK, double recallAtK) {}

    // P6.1: whitespace-delimited words, NOT model tokens.
    public static List<String> chunks(String text, int size, int overlap) {
        Objects.requireNonNull(text, "text");
        if (size <= 0 || overlap < 0 || overlap >= size)
            throw new IllegalArgumentException("require 0 <= overlap < size");
        if (text.isBlank()) return List.of();
        String[] words = text.strip().split("\\s+");
        List<String> output = new ArrayList<>();
        int step = size - overlap;
        for (int start = 0; start < words.length; start += step) {
            int end = (int) Math.min((long) start + size, words.length);
            output.add(String.join(" ", Arrays.copyOfRange(words, start, end)));
            if (end == words.length) break;
        }
        return List.copyOf(output);
    }

    // P6.2: normalize with hypot to avoid squared-norm overflow for large components.
    public static double cosine(double[] a, double[] b) {
        if (a.length == 0 || a.length != b.length)
            throw new IllegalArgumentException("vector dimensions");
        double na = 0, nb = 0;
        for (int i = 0; i < a.length; i++) {
            if (!Double.isFinite(a[i]) || !Double.isFinite(b[i]))
                throw new IllegalArgumentException("non-finite vector");
            na = Math.hypot(na, a[i]); nb = Math.hypot(nb, b[i]);
        }
        if (na == 0 || nb == 0 || !Double.isFinite(na) || !Double.isFinite(nb))
            throw new IllegalArgumentException("invalid norm");
        double value = 0;
        for (int i = 0; i < a.length; i++) value += (a[i] / na) * (b[i] / nb);
        return Math.max(-1, Math.min(1, value));
    }

    public static List<Hit> retrieve(List<Chunk> chunks, double[] query, long userId, int k) {
        if (k <= 0) throw new IllegalArgumentException("k must be positive");
        // Filter BEFORE ranking/top-k. In a real system userId comes from the principal.
        return chunks.stream().filter(c -> c.ownerId() == userId)
            .map(c -> new Hit(c, cosine(query, c.vector())))
            .sorted(Comparator.comparingDouble(Hit::score).reversed()
                .thenComparing(h -> h.chunk().id()))
            .limit(k).toList();
    }

    // P6.3: validates source IDs only. Semantic support must be checked separately.
    public static boolean validCitations(List<String> citedIds, List<Hit> hits) {
        if (citedIds == null || citedIds.isEmpty()) return false;
        Set<String> allowed = new HashSet<>();
        for (Hit h : hits) allowed.add(h.chunk().id());
        return citedIds.stream().allMatch(allowed::contains);
    }

    // P6.4: precision denominator is k, even when fewer results are returned.
    // Undefined recall (empty gold set) is excluded here via an explicit precondition.
    public static Metrics metrics(List<String> retrieved, Set<String> relevant, int k) {
        if (k <= 0 || relevant.isEmpty()) throw new IllegalArgumentException("invalid metric input");
        if (new HashSet<>(retrieved).size() != retrieved.size())
            throw new IllegalArgumentException("duplicate retrieved IDs");
        long matches = retrieved.stream().limit(k).filter(relevant::contains).count();
        return new Metrics((double) matches / k, (double) matches / relevant.size());
    }
}
