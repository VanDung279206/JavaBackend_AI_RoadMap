import java.util.*;
import java.util.concurrent.*;
/** Single-process learning primitives, NOT durable distributed idempotency. */
public final class ConcurrentLab {
    public static final class Missing extends RuntimeException {}
    public static final class Conflict extends RuntimeException {}
    public record Document(long id,String owner,String content,long version) {}
    public static final class Store {
        private final Map<Long,Document> data=new HashMap<>();private long next=1;
        public synchronized Document create(String owner,String content) {
            Objects.requireNonNull(owner);Objects.requireNonNull(content);
            var d=new Document(next++,owner,content,0);data.put(d.id(),d);return d;
        }
        public synchronized Document get(String owner,long id) {
            var d=data.get(id);if(d==null||!d.owner().equals(owner))throw new Missing();return d;
        }
        public synchronized Document update(String owner,long id,long expectedVersion,String content) {
            var old=get(owner,id);if(old.version()!=expectedVersion)throw new Conflict();
            var updated=new Document(id,owner,Objects.requireNonNull(content),Math.incrementExact(old.version()));data.put(id,updated);return updated;
        }
    }
    public static final class Deduplicator {
        private record Key(String owner,String key) {}
        private record Entry(String payload,CompletableFuture<String> result) {}
        private final ConcurrentHashMap<Key,Entry> entries=new ConcurrentHashMap<>();
        public String run(String owner,String key,String payload,Callable<String> action)throws Exception {
            if(owner==null||owner.isBlank()||key==null||key.isBlank()||payload==null)throw new IllegalArgumentException("request identity");
            Objects.requireNonNull(action);
            Key namespace=new Key(owner,key);Entry fresh=new Entry(payload,new CompletableFuture<>());
            Entry existing=entries.putIfAbsent(namespace,fresh);
            if(existing!=null){if(!existing.payload().equals(payload))throw new Conflict();return unwrap(existing.result());}
            try{String value=action.call();fresh.result().complete(value);return value;}
            catch(Throwable failure){fresh.result().completeExceptionally(failure);entries.remove(namespace,fresh);if(failure instanceof Exception e)throw e;throw (Error)failure;}
        }
        private static String unwrap(CompletableFuture<String> future)throws Exception {
            try{return future.get();}catch(ExecutionException e){if(e.getCause() instanceof Exception ex)throw ex;throw (Error)e.getCause();}
        }
    }
    public static <T> T within(ExecutorService pool,Callable<T> action,long timeoutMillis)throws Exception {
        if(timeoutMillis<=0)throw new IllegalArgumentException("positive timeout required");
        Future<T> future=pool.submit(action);
        try{return future.get(timeoutMillis,TimeUnit.MILLISECONDS);}
        catch(TimeoutException e){future.cancel(true);throw e;}
        catch(InterruptedException e){future.cancel(true);Thread.currentThread().interrupt();throw e;}
        catch(ExecutionException e){if(e.getCause() instanceof Exception ex)throw ex;throw (Error)e.getCause();}
    }
}