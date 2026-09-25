import java.util.*;
import java.util.function.Supplier;
public final class Bugs {
    public record Doc(long id,long owner,String text) {}
    public static final class Missing extends RuntimeException {}
    public static final class Failure extends RuntimeException { public final int status;public Failure(int s){status=s;} }
    public static void add(Map<Long,Doc> docs,Doc d) {
        if(docs.putIfAbsent(d.id(),d)!=null)throw new IllegalArgumentException("duplicate");
    }
    public static <T> List<T> page(List<T> a,int page,int size) {
        if(page<0||size<1||size>100)throw new IllegalArgumentException();
        long from=(long)page*size;
        if(from>=a.size())return List.of();
        return List.copyOf(a.subList((int)from,(int)Math.min(from+size,a.size())));
    }
    public static Doc owned(Map<Long,Doc> docs,long id,long user) {
        Doc d=docs.get(id);if(d==null||d.owner()!=user)throw new Missing();return d;
    }
    public static String retry(Supplier<String> gateway) {
        for(int attempt=0;attempt<2;attempt++)try{return gateway.get();}
        catch(Failure e){if(attempt==1||(e.status!=429&&e.status!=503))throw e;}
        throw new IllegalStateException();
    }
    public static int distinct(String s) {
        Map<Character,Integer> last=new HashMap<>();int left=0,best=0;
        for(int r=0;r<s.length();r++) {Integer old=last.put(s.charAt(r),r);if(old!=null)left=Math.max(left,old+1);best=Math.max(best,r-left+1);}return best;
    }
    // Input is already sorted by relevance. Preserve that order.
    public static List<Doc> topOwned(List<Doc> ranked,long user,int k) {
        return ranked.stream().filter(d->d.owner()==user).limit(k).toList();
    }
    public static boolean budget(long input,long output,long limit) {
        if(input<0||output<0||limit<0)throw new IllegalArgumentException();
        return input<=limit&&output<=limit-input;
    }
    public static String boundedRetry(Supplier<String> gateway) {
        for(int attempt=0;attempt<2;attempt++)try{return gateway.get();}
        catch(Failure e){if(attempt==1||(e.status!=429&&e.status!=503))throw e;}
        throw new IllegalStateException();
    }
}