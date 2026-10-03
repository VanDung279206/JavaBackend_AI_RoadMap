import java.util.*;
import java.util.concurrent.*;
import java.util.function.Supplier;
public final class RagSafetyLab {
 public record ModelLimit(String model,int context,int outputReserve) {}
 public static boolean fits(ModelLimit limit,long system,long history,long question,long sources){throw new UnsupportedOperationException("TODO A01");}
 public record Evidence(String id,String owner,int version,String claim) {}
 public record Decision(boolean abstain,List<String> citations) {}
 public static Decision decide(String owner,Map<String,Integer> current,List<Evidence> retrieved){throw new UnsupportedOperationException("TODO A02");}
 public static final class Index {
  public void edit(String id,int version){throw new UnsupportedOperationException("TODO A03");}
  public CompletableFuture<Boolean> enqueue(String id,int version,Supplier<List<String>> work,Executor executor){throw new UnsupportedOperationException("TODO A03");}
  public List<String> get(String id){throw new UnsupportedOperationException("TODO A03");}
 }
}
