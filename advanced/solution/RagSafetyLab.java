import java.util.*;
import java.util.concurrent.*;
import java.util.function.Supplier;
public final class RagSafetyLab {
    public record ModelLimit(String model,int context,int outputReserve) {}
    public static boolean fits(ModelLimit limit,long system,long history,long question,long sources) {
        if(limit==null||limit.model()==null||limit.model().isBlank()||limit.context()<=0||limit.outputReserve()<0||limit.outputReserve()>limit.context())throw new IllegalArgumentException("model config");
        long remaining=(long)limit.context()-limit.outputReserve();
        for(long count:new long[]{system,history,question,sources}) {
            if(count<0)throw new IllegalArgumentException("negative tokens");
            if(count>remaining)return false;remaining-=count;
        }
        return true;
    }
    public record Evidence(String id,String owner,int version,String claim) {}
    public record Decision(boolean abstain,List<String> citations) {}
    public static Decision decide(String owner,Map<String,Integer> current,List<Evidence> retrieved) {
        List<Evidence> allowed=retrieved.stream().filter(e->owner.equals(e.owner())&&Objects.equals(current.get(e.id()),e.version())).toList();
        if(allowed.isEmpty()||allowed.stream().map(Evidence::claim).distinct().count()!=1)return new Decision(true,List.of());
        return new Decision(false,allowed.stream().map(Evidence::id).distinct().sorted().toList());
    }
    public static final class Index {
        private final Map<String,Integer> versions=new HashMap<>();
        private final Map<String,List<String>> chunks=new HashMap<>();
        public synchronized void edit(String id,int version) {
            if(version<=versions.getOrDefault(id,-1))throw new IllegalArgumentException("version must increase");
            versions.put(id,version);chunks.remove(id);
        }
        public CompletableFuture<Boolean> enqueue(String id,int version,Supplier<List<String>> work,Executor executor) {
            return CompletableFuture.supplyAsync(()->{
                List<String> computed=List.copyOf(work.get());
                synchronized(this){if(!Objects.equals(versions.get(id),version))return false;chunks.put(id,computed);return true;}
            },executor);
        }
        public synchronized List<String> get(String id){return chunks.getOrDefault(id,List.of());}
    }
}
