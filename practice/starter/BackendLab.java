import java.util.*;
public final class BackendLab {
    public record OwnedDocument(long id, long ownerId, String content) {}
    public static final class NotFound extends RuntimeException {}
    public static OwnedDocument requireOwned(Map<Long,OwnedDocument> docs, long id, long user) {
        throw new UnsupportedOperationException("TODO P4.1");
    }
    public static <T> List<T> page(List<T> sortedItems, int page, int size) {
        throw new UnsupportedOperationException("TODO P3.3");
    }
}
