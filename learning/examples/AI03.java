import java.util.*;
import java.nio.file.*;
import java.util.concurrent.*;

public class AI03 {
    public static void main(String[] args) throws Exception {
        var pool=Executors.newSingleThreadExecutor();
        var gate=new CountDownLatch(1);
        try {
            Future<String> task=pool.submit(()->{ gate.await(); return "ok"; });
            try { task.get(20,TimeUnit.MILLISECONDS); } catch(TimeoutException e) { task.cancel(true); System.out.println("timeout cancelled"); }
            int attempts=0;
            while(attempts<3) { attempts++; if(attempts==3) break; }
            System.out.println("attempts="+attempts);
        } finally { gate.countDown(); pool.shutdownNow(); }
    }
}
