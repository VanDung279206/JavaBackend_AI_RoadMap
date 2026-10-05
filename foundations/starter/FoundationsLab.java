import java.io.IOException;
import java.nio.file.Path;
import java.util.List;

public final class FoundationsLab {
    public record Stats(long sum,int minimum,int maximum) {}
    public static Stats stats(int[] values) { throw new UnsupportedOperationException("TODO J01"); }
    public static final class DocumentKey {
        public DocumentKey(String owner,long id) { /* TODO J02: validate and keep immutable fields */ }
        // TODO J02: equals and hashCode use BOTH owner and id.
    }
    public static <T> List<T> distinct(List<? extends T> values) { throw new UnsupportedOperationException("TODO J02"); }
    public static List<String> readTitles(Path path) throws IOException { throw new UnsupportedOperationException("TODO J03"); }
}
