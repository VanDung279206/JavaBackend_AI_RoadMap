import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;
public final class BugChecks {
    static void ok(boolean b){if(!b)throw new AssertionError("contract violated");}
    static void raises(Class<? extends Throwable> type,Runnable r){try{r.run();}catch(Throwable t){ok(type.isInstance(t));return;}throw new AssertionError("missing exception");}
    static final Map<String,Runnable> TESTS=new LinkedHashMap<>();
    static {
        TESTS.put("B01",()->{var d=new Bugs.Doc(1,1,"old");Map<Long,Bugs.Doc> m=new HashMap<>();m.put(1L,d);raises(IllegalArgumentException.class,()->Bugs.add(m,new Bugs.Doc(1,1,"new")));ok(m.get(1L).equals(d));});
        TESTS.put("B02",()->ok(Bugs.page(List.of(1,2,3),Integer.MAX_VALUE,100).isEmpty()));
        TESTS.put("B03",()->raises(Bugs.Missing.class,()->Bugs.owned(Map.of(1L,new Bugs.Doc(1,1,"secret")),1,2)));
        TESTS.put("B04",()->{var n=new AtomicInteger();raises(Bugs.Failure.class,()->Bugs.retry(()->{n.incrementAndGet();throw new Bugs.Failure(400);}));ok(n.get()==1);});
        TESTS.put("B05",()->ok(Bugs.distinct("abba")==2));
        TESTS.put("B06",()->{var a=new Bugs.Doc(1,1,"a");var b=new Bugs.Doc(2,1,"b");var x=new Bugs.Doc(9,2,"private");ok(Bugs.topOwned(List.of(x,a,b),1,2).equals(List.of(a,b)));});
        TESTS.put("B07",()->ok(!Bugs.budget(Long.MAX_VALUE,1,Long.MAX_VALUE)));
        TESTS.put("B08",()->{var n=new AtomicInteger();raises(Bugs.Failure.class,()->Bugs.boundedRetry(()->{if(n.incrementAndGet()>3)throw new IllegalStateException("watchdog: unbounded retry");throw new Bugs.Failure(503);}));ok(n.get()==2);});
    }
    public static void main(String[] args){
        var ids=(args.length==0||args[0].equals("all"))?new ArrayList<>(TESTS.keySet()):Arrays.asList(args[0].split(","));int failed=0;
        for(String id:ids)try{if(!TESTS.containsKey(id))throw new IllegalArgumentException("unknown id");TESTS.get(id).run();System.out.println("PASS "+id);}catch(Throwable t){failed++;System.out.println("FAIL "+id+": "+t);}
        System.out.println("RESULT: "+(ids.size()-failed)+"/"+ids.size()+" bug groups; failures="+failed);if(failed>0)System.exit(1);
    }
}