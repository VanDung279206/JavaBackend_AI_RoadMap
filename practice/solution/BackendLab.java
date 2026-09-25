import java.util.*;

/** Business-rule examples, independent of Spring and database adapters. */
public final class BackendLab {
    public record OwnedDocument(long id, long ownerId, String content) {}
    public static final class NotFound extends RuntimeException {}

    // P4.1: hide resource existence from a different owner; HTTP mapping is a separate layer.
    public static OwnedDocument requireOwned(
            Map<Long, OwnedDocument> docs, long id, long principalUserId) {
        OwnedDocument doc = docs.get(id);
        if (doc == null || doc.ownerId() != principalUserId) throw new NotFound();
        return doc;
    }

    // P3.3: stable pagination in a list. Database pagination is covered in SQL/Spring notes.
    public static <T> List<T> page(List<T> sortedItems, int page, int size) {
        if (page < 0 || size < 1 || size > 100)
            throw new IllegalArgumentException("invalid pagination");
        long fromLong = (long) page * size;
        if (fromLong >= sortedItems.size()) return List.of();
        int from = (int) fromLong;
        int to = (int) Math.min(fromLong + size, sortedItems.size());
        return List.copyOf(sortedItems.subList(from, to));
    }
}
