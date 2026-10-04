import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.util.*;

public final class FoundationsLab {
    public record Stats(long sum, int minimum, int maximum) {}
    public static Stats stats(int[] values) {
        if (values == null || values.length == 0) throw new IllegalArgumentException("empty values");
        long sum = 0; int min = values[0], max = values[0];
        for (int value : values) { sum += value; min = Math.min(min,value); max = Math.max(max,value); }
        return new Stats(sum,min,max);
    }
    public static final class DocumentKey {
        private final String owner;
        private final long id;
        public DocumentKey(String owner,long id) {
            if (owner == null || owner.isBlank() || id <= 0) throw new IllegalArgumentException("key");
            this.owner=owner;this.id=id;
        }
        @Override public boolean equals(Object other) {
            return other instanceof DocumentKey key && id==key.id && owner.equals(key.owner);
        }
        @Override public int hashCode() { return Objects.hash(owner,id); }
    }
    public static <T> List<T> distinct(List<? extends T> values) {
        Objects.requireNonNull(values);
        LinkedHashSet<T> seen=new LinkedHashSet<>();
        for(T value:values) seen.add(Objects.requireNonNull(value));
        return List.copyOf(seen);
    }
    public static List<String> readTitles(Path path) throws IOException {
        try(var reader=Files.newBufferedReader(path,StandardCharsets.UTF_8)) {
            List<String> titles=new ArrayList<>();String line;
            while((line=reader.readLine())!=null) {
                String title=line.strip();if(!title.isEmpty())titles.add(title);
            }
            return List.copyOf(titles);
        }
    }
}
