import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.*;
public final class ConcurrencyChecks {
    interface Checked {void run()throws Exception;}
    static int assertions;
    static void eq(Object expected,Object actual){assertions++;if(!Objects.equals(expected,actual))throw new AssertionError("expected="+expected+" actual="+actual);}
    static void check(boolean value){assertions++;if(!value)throw new AssertionError("condition false");}
    static void expect(Class<? extends Throwable> type,Checked action)throws Exception {assertions++;try{action.run();}catch(Throwable e){if(type.isInstance(e))return;throw e;}throw new AssertionError("Expected "+type.getSimpleName());}
    static void close(ExecutorService pool)throws Exception {pool.shutdownNow();if(!pool.awaitTermination(3,TimeUnit.SECONDS))throw new AssertionError("Worker did not stop");}
    static void c01()throws Exception {
        var store=new ConcurrentLab.Store();var doc=store.create("an","initial");eq(0L,doc.version());
        var pool=Executors.newFixedThreadPool(2);var ready=new CountDownLatch(2);var go=new CountDownLatch(1);
        Callable<Boolean> update=()->{ready.countDown();if(!go.await(3,TimeUnit.SECONDS))throw new AssertionError("start barrier");try{store.update("an",doc.id(),doc.version(),Thread.currentThread().getName());return true;}catch(ConcurrentLab.Conflict expected){return false;}};
        try{Future<Boolean>a=pool.submit(update),b=pool.submit(update);check(ready.await(3,TimeUnit.SECONDS));go.countDown();int winners=(a.get(3,TimeUnit.SECONDS)?1:0)+(b.get(3,TimeUnit.SECONDS)?1:0);eq(1,winners);eq(1L,store.get("an",doc.id()).version());
            expect(ConcurrentLab.Missing.class,()->store.update("binh",doc.id(),0,"leak"));expect(ConcurrentLab.Conflict.class,()->store.update("an",doc.id(),0,"stale"));eq(1L,store.get("an",doc.id()).version());
        }finally{go.countDown();close(pool);}
    }
    static void c02()throws Exception {
        var dedup=new ConcurrentLab.Deduplicator();var count=new AtomicInteger();var entered=new CountDownLatch(1);var release=new CountDownLatch(1);var pool=Executors.newFixedThreadPool(2);
        try{
            Future<String>a=pool.submit(()->dedup.run("an","key","payload",()->{count.incrementAndGet();entered.countDown();if(!release.await(3,TimeUnit.SECONDS))throw new AssertionError("release");return "result-1";}));
            check(entered.await(3,TimeUnit.SECONDS));var secondStarted=new CountDownLatch(1);
            Future<String>b=pool.submit(()->{secondStarted.countDown();return dedup.run("an","key","payload",()->{count.incrementAndGet();return "wrong";});});
            check(secondStarted.await(3,TimeUnit.SECONDS));expect(ConcurrentLab.Conflict.class,()->dedup.run("an","key","different",()->"wrong"));release.countDown();
            eq("result-1",a.get(3,TimeUnit.SECONDS));eq("result-1",b.get(3,TimeUnit.SECONDS));eq(1,count.get());
            eq("result-1",dedup.run("an","key","payload",()->"wrong"));eq("binh-result",dedup.run("binh","key","payload",()->"binh-result"));
            expect(IllegalStateException.class,()->dedup.run("an","retry","x",()->{throw new IllegalStateException("temporary");}));
            eq("recovered",dedup.run("an","retry","x",()->"recovered"));
            // Record key prevents ambiguous string concatenation (a:b,c) vs (a,b:c).
            eq("left",dedup.run("a:b","c","x",()->"left"));eq("right",dedup.run("a","b:c","x",()->"right"));
        }finally{release.countDown();close(pool);}
    }
    static void c03()throws Exception {
        var workers=Executors.newSingleThreadExecutor();var callers=Executors.newSingleThreadExecutor();var started=new CountDownLatch(1);var interrupted=new CountDownLatch(1);var never=new CountDownLatch(1);
        try{
            eq("ok",ConcurrentLab.within(workers,()->"ok",2000));expect(IllegalStateException.class,()->ConcurrentLab.within(workers,()->{throw new IllegalStateException("model error");},2000));expect(IllegalArgumentException.class,()->ConcurrentLab.within(workers,()->"x",0));
            Future<Boolean> timeout=callers.submit(()->{try{ConcurrentLab.within(workers,()->{started.countDown();try{never.await();return "unexpected";}catch(InterruptedException e){interrupted.countDown();throw e;}},1000);return false;}catch(TimeoutException expected){return true;}});
            check(started.await(3,TimeUnit.SECONDS));check(timeout.get(4,TimeUnit.SECONDS));check(interrupted.await(3,TimeUnit.SECONDS));
            Future<Boolean> callerInterrupted=callers.submit(()->{Thread.currentThread().interrupt();try{ConcurrentLab.within(workers,()->{never.await();return "x";},1000);return false;}catch(InterruptedException expected){return Thread.currentThread().isInterrupted();}finally{Thread.interrupted();}});
            check(callerInterrupted.get(3,TimeUnit.SECONDS));
        }finally{never.countDown();close(callers);close(workers);}
    }
    public static void main(String[] args)throws Exception {
        Map<String,Checked> all=new LinkedHashMap<>();all.put("C01",ConcurrencyChecks::c01);all.put("C02",ConcurrencyChecks::c02);all.put("C03",ConcurrencyChecks::c03);
        var ids=args.length==0||args[0].equals("all")?new ArrayList<>(all.keySet()):Arrays.asList(args[0].split(","));int failed=0;
        for(String id:ids){if(!all.containsKey(id))throw new IllegalArgumentException("Unknown ID "+id);try{all.get(id).run();System.out.println("PASS "+id);}catch(Throwable e){failed++;System.out.println("FAIL "+id+" "+e);}}
        System.out.println("Concurrency groups="+ids.size()+" assertions="+assertions+" failed="+failed);if(failed>0)System.exit(1);
    }
}