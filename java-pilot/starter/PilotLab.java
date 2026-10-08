import java.io.IOException;
import java.nio.file.Path;
import java.util.*;

/** Fill TODOs one exercise at a time. Keep signatures to run the shared checks. */
public final class PilotLab {
    public record Doc(long id, String title) {}
    public record Owned(String owner, long id, String title) {}
    public record Key(String owner, long id) {}
    public record Summary(int count, Map<String, Integer> initials) {}
    // JP01: trace total after each iteration before replacing the TODO.
    public static int trace() { throw new UnsupportedOperationException("TODO JP01"); }
    // JP02: a and b refer to the same ArrayList; predict both sizes.
    public static String referenceTrace() { throw new UnsupportedOperationException("TODO JP02"); }
    public static String normalize(String title) { throw new UnsupportedOperationException("TODO JP03"); }
    public static List<String> listTrace() { throw new UnsupportedOperationException("TODO JP04"); }
    public static Optional<Doc> find(List<Doc> docs,long id) {
        for(Doc doc:docs) { /* TODO JP05: compare doc.id(), return Optional.of(doc) */ }
        return Optional.empty();
    }
    public static Map<String,Integer> count(List<String> words) {
        var counts=new LinkedHashMap<String,Integer>();
        for(String word:words) { /* TODO JP06: use getOrDefault or merge */ }
        return Map.copyOf(counts);
    }
    public static Doc create(long id,String title) { throw new UnsupportedOperationException("TODO JP07"); }
    public static void add(Map<Long,Doc> docs,Doc doc) { throw new UnsupportedOperationException("TODO JP08"); }
    public static List<Doc> snapshot(Collection<Doc> docs) { throw new UnsupportedOperationException("TODO JP09"); }
    public static void rename(Map<Long,Doc> docs,long id,String title) { throw new UnsupportedOperationException("TODO JP10"); }
    public static long parseId(String value) { throw new UnsupportedOperationException("TODO JP11"); }
    public static List<String> readTitles(Path file) throws IOException { throw new UnsupportedOperationException("TODO JP12"); }
    public static List<Doc> search(Collection<Doc> docs,String query) { throw new UnsupportedOperationException("TODO JP13"); }
    public static void importRows(Map<Long,Doc> docs,List<String> rows) { throw new UnsupportedOperationException("TODO JP14"); }
    public static void save(Path file,Collection<Doc> docs) throws IOException { throw new UnsupportedOperationException("TODO JP15"); }
    public static Summary summarize(Collection<Doc> docs) { throw new UnsupportedOperationException("TODO JP16"); }
    // JP17: deliberately buggy. Reproduce adjacent blank values being skipped.
    public static List<String> removeBlank(List<String> titles) { var copy=new ArrayList<>(titles); for(int i=0;i<copy.size();i++)if(copy.get(i).isBlank())copy.remove(i); return copy; }
    // JP18: deliberately buggy. Trace the type used for the addition.
    public static long sum(int[] values) { int total=0; for(int value:values)total+=value; return total; }
    public static List<Owned> distinctOwned(List<Owned> docs) { throw new UnsupportedOperationException("TODO JP19"); }
    public static final class RevisionBox {
        private long version=0;
        private String title="Java";
        public boolean rename(long expectedVersion,String next) { throw new UnsupportedOperationException("TODO JP20"); }
        public long version() { return version; }
        public String title() { return title; }
    }
}
