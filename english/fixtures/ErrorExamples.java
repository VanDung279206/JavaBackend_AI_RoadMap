import java.util.concurrent.*;
/** These errors are deliberate diagnostic fixtures, not production code. */
public final class ErrorExamples {
    public static void main(String[] args)throws Exception {
        switch(args[0]) {
            case "E01" -> {String title=null;System.out.println(title.length());}
            case "E02" -> {int[] a={1,2,3};System.out.println(a[3]);}
            case "E03" -> Integer.parseInt("12x");
            case "E04" -> {var c=new JavaCoreLab.Catalog();c.add(new JavaCoreLab.Document(1,"First","x"));c.add(new JavaCoreLab.Document(1,"Second","y"));}
            case "E05" -> throw new UnsupportedOperationException("TODO P1.1");
            case "E06" -> {int expected=3,actual=2;if(expected!=actual)throw new AssertionError("expected="+expected+" actual="+actual);}
            case "E07" -> {var pool=Executors.newSingleThreadExecutor();var never=new CountDownLatch(1);try{pool.submit(()->{never.await();return "x";}).get(20,TimeUnit.MILLISECONDS);}finally{pool.shutdownNow();}}
            case "E08" -> {int missingValue=5;System.out.println(missingValue);}
            default -> throw new IllegalArgumentException("unknown case");
        }
    }
}