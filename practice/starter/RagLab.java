import java.util.*;
public final class RagLab {
    public record Chunk(String id, long ownerId, String text, double[] vector) {}
    public record Hit(Chunk chunk, double score) {}
    public record Metrics(double precisionAtK, double recallAtK) {}
    public static List<String> chunks(String text, int size, int overlap) {
        throw new UnsupportedOperationException("TODO P6.1");
    }
    public static double cosine(double[] a, double[] b) {
        throw new UnsupportedOperationException("TODO P6.2");
    }
    public static List<Hit> retrieve(List<Chunk> chunks, double[] query, long user, int k) {
        throw new UnsupportedOperationException("TODO P6.2");
    }
    public static boolean validCitations(List<String> ids, List<Hit> hits) {
        throw new UnsupportedOperationException("TODO P6.3");
    }
    public static Metrics metrics(List<String> retrieved, Set<String> relevant, int k) {
        throw new UnsupportedOperationException("TODO P6.4");
    }
}
