import java.util.concurrent.*;
public final class ConcurrentLab {
    public static final class Missing extends RuntimeException {}
    public static final class Conflict extends RuntimeException {}
    public record Document(long id,String owner,String content,long version) {}
    public static final class Store {
        public Document create(String owner,String content){throw new UnsupportedOperationException("TODO C01");}
        public Document get(String owner,long id){throw new UnsupportedOperationException("TODO C01");}
        public Document update(String owner,long id,long expectedVersion,String content){throw new UnsupportedOperationException("TODO C01");}
    }
    public static final class Deduplicator {
        public String run(String owner,String key,String payload,Callable<String> action)throws Exception {throw new UnsupportedOperationException("TODO C02");}
    }
    public static <T> T within(ExecutorService pool,Callable<T> action,long timeoutMillis)throws Exception {throw new UnsupportedOperationException("TODO C03");}
}