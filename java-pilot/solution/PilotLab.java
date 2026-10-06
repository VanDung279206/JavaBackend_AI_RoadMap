import java.io.IOException;
import java.nio.file.*;
import java.util.*;
import java.util.stream.Collectors;

/** Reference answers; compile separately from the learner's starter. */
public final class PilotLab {
    public record Doc(long id, String title) {}
    public record Owned(String owner, long id, String title) {}
    public record Key(String owner, long id) {}
    public record Summary(int count, Map<String, Integer> initials) {}
    public static int trace() { int total=0; for(int n:new int[]{2,4,6}) total+=n/2; return total; }
    public static String referenceTrace() { var a=new ArrayList<>(List.of("Java")); var b=a; b.add("SQL"); return a.size()+":"+b.size(); }
    public static String normalize(String title) { if(title==null||title.isBlank()) throw new IllegalArgumentException("blank title"); return title.strip(); }
    public static List<String> listTrace() { var a=new ArrayList<>(List.of("A","B","C")); a.remove(1); a.add("D"); return List.copyOf(a); }
    public static Optional<Doc> find(List<Doc> docs, long id) { return docs.stream().filter(d->d.id()==id).findFirst(); }
    public static Map<String,Integer> count(List<String> words) { var result=new LinkedHashMap<String,Integer>(); for(String word:words) result.merge(word,1,Integer::sum); return Map.copyOf(result); }
    public static Doc create(long id, String title) { if(id<=0)throw new IllegalArgumentException("id must be positive"); return new Doc(id,normalize(title)); }
    public static void add(Map<Long,Doc> docs, Doc doc) { Doc valid=create(doc.id(),doc.title()); if(docs.containsKey(valid.id()))throw new IllegalArgumentException("duplicate id"); docs.put(valid.id(),valid); }
    public static List<Doc> snapshot(Collection<Doc> docs) { return List.copyOf(docs); }
    public static void rename(Map<Long,Doc> docs,long id,String title) { if(!docs.containsKey(id))throw new NoSuchElementException("missing id"); Doc next=create(id,title); docs.put(id,next); }
    public static long parseId(String value) { try { long id=Long.parseLong(value.strip()); if(id<=0)throw new IllegalArgumentException("id must be positive"); return id; } catch(NullPointerException|NumberFormatException e) { throw new IllegalArgumentException("invalid id",e); } }
    public static List<String> readTitles(Path file) throws IOException { try(var lines=Files.lines(file)) { return lines.map(String::strip).filter(s->!s.isEmpty()).toList(); } }
    public static List<Doc> search(Collection<Doc> docs,String query) { String needle=normalize(query).toLowerCase(Locale.ROOT); return docs.stream().filter(d->d.title().toLowerCase(Locale.ROOT).contains(needle)).sorted(Comparator.comparing(Doc::title).thenComparingLong(Doc::id)).toList(); }
    public static void importRows(Map<Long,Doc> docs,List<String> rows) { var staged=new LinkedHashMap<>(docs); for(String row:rows) { String[] parts=row.split("\\|",-1); if(parts.length!=2)throw new IllegalArgumentException("expected id|title"); add(staged,create(parseId(parts[0]),parts[1])); } docs.clear(); docs.putAll(staged); }
    public static void save(Path file,Collection<Doc> docs) throws IOException { var rows=new ArrayList<String>(); for(Doc d:docs.stream().sorted(Comparator.comparingLong(Doc::id)).toList()) { Doc valid=create(d.id(),d.title()); if(valid.title().contains("|")||valid.title().contains("\n")||valid.title().contains("\r"))throw new IllegalArgumentException("unsupported delimiter"); rows.add(valid.id()+"|"+valid.title()); } Files.write(file,rows,java.nio.charset.StandardCharsets.UTF_8); }
    public static Summary summarize(Collection<Doc> docs) { Map<String,Integer> initials=docs.stream().collect(Collectors.toMap(d->d.title().substring(0,1).toUpperCase(Locale.ROOT),d->1,Integer::sum)); return new Summary(docs.size(),Map.copyOf(initials)); }
    public static List<String> removeBlank(List<String> titles) { return titles.stream().filter(s->!s.isBlank()).toList(); }
    public static long sum(int[] values) { long total=0; for(int value:values)total+=value; return total; }
    public static List<Owned> distinctOwned(List<Owned> docs) { var byKey=new LinkedHashMap<Key,Owned>(); for(Owned d:docs)byKey.putIfAbsent(new Key(d.owner(),d.id()),d); return List.copyOf(byKey.values()); }
    public static final class RevisionBox {
        private long version=0;
        private String title="Java";
        public synchronized boolean rename(long expectedVersion,String next) { String valid=normalize(next); if(expectedVersion!=version)return false; title=valid; version++; return true; }
        public synchronized long version() { return version; }
        public synchronized String title() { return title; }
    }
}
