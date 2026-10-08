import java.nio.file.*;
import java.util.*;
import java.util.concurrent.*;

public final class PilotChecks {
    interface Action { void run() throws Exception; }
    static void eq(Object expected,Object actual) { if(!Objects.equals(expected,actual))throw new AssertionError("expected="+expected+" actual="+actual); }
    static void rejects(Class<? extends Throwable> type,Action action) throws Exception { try{action.run();}catch(Exception e){if(type.isInstance(e))return;throw e;}throw new AssertionError("expected "+type.getSimpleName()); }
    static PilotLab.Doc doc(long id,String title){return new PilotLab.Doc(id,title);}
    static void check(String id) throws Exception {
        switch(id) {
            case "JP01" -> eq(6,PilotLab.trace());
            case "JP02" -> eq("2:2",PilotLab.referenceTrace());
            case "JP03" -> {eq("Java",PilotLab.normalize("  Java  ")); rejects(IllegalArgumentException.class,()->PilotLab.normalize(" \t"));rejects(IllegalArgumentException.class,()->PilotLab.normalize(null));}
            case "JP04" -> eq(List.of("A","C","D"),PilotLab.listTrace());
            case "JP05" -> {eq(Optional.of(doc(2,"SQL")),PilotLab.find(List.of(doc(1,"Java"),doc(2,"SQL")),2));eq(Optional.empty(),PilotLab.find(List.of(),9));eq(Optional.empty(),PilotLab.find(List.of(doc(1,"A")),8));}
            case "JP06" -> {eq(Map.of("java",2,"sql",1),PilotLab.count(List.of("java","sql","java")));eq(Map.of(),PilotLab.count(List.of()));}
            case "JP07" -> {eq(doc(1,"Java"),PilotLab.create(1," Java "));rejects(IllegalArgumentException.class,()->PilotLab.create(0,"A"));rejects(IllegalArgumentException.class,()->PilotLab.create(1,null));rejects(IllegalArgumentException.class,()->PilotLab.create(1," "));}
            case "JP08" -> {var docs=new LinkedHashMap<Long,PilotLab.Doc>();PilotLab.add(docs,doc(1,"Java"));rejects(IllegalArgumentException.class,()->PilotLab.add(docs,doc(1,"SQL")));eq(Map.of(1L,doc(1,"Java")),docs);rejects(IllegalArgumentException.class,()->PilotLab.add(docs,doc(-1,"X")));}
            case "JP09" -> {var input=new ArrayList<>(List.of(doc(1,"A")));var output=PilotLab.snapshot(input);input.clear();eq(List.of(doc(1,"A")),output);rejects(UnsupportedOperationException.class,()->output.clear());}
            case "JP10" -> {var docs=new LinkedHashMap<>(Map.of(1L,doc(1,"A")));PilotLab.rename(docs,1," B ");eq(doc(1,"B"),docs.get(1L));rejects(IllegalArgumentException.class,()->PilotLab.rename(docs,1," "));eq(doc(1,"B"),docs.get(1L));rejects(NoSuchElementException.class,()->PilotLab.rename(docs,2,"C"));}
            case "JP11" -> {eq(12L,PilotLab.parseId(" 12 "));for(String value:Arrays.asList("x","0","-1","9223372036854775808",null))rejects(IllegalArgumentException.class,()->PilotLab.parseId(value));}
            case "JP12" -> {Path file=Files.createTempFile("pilot-",".txt");try{Files.writeString(file," Tiếng Việt \r\n\nJava\n");eq(List.of("Tiếng Việt","Java"),PilotLab.readTitles(file));Files.writeString(file,"");eq(List.of(),PilotLab.readTitles(file));}finally{Files.delete(file);}rejects(java.io.IOException.class,()->PilotLab.readTitles(file));}
            case "JP13" -> {
                var input=new ArrayList<>(List.of(doc(1,"Java Streams"),doc(9,"Java Basics"),doc(2,"SQL"),doc(7,"Java Basics")));
                var before=List.copyOf(input);
                eq(List.of(doc(7,"Java Basics"),doc(9,"Java Basics"),doc(1,"Java Streams")),PilotLab.search(input," JAVA "));
                eq(before,input);
                eq(List.of(),PilotLab.search(input,"rust"));
                rejects(IllegalArgumentException.class,()->PilotLab.search(input," "));
            }
            case "JP14" -> {var docs=new LinkedHashMap<>(Map.of(1L,doc(1,"A")));rejects(IllegalArgumentException.class,()->PilotLab.importRows(docs,List.of("2|B","1|C")));eq(Map.of(1L,doc(1,"A")),docs);rejects(IllegalArgumentException.class,()->PilotLab.importRows(docs,List.of("3|C","bad")));eq(1,docs.size());PilotLab.importRows(docs,List.of("2| B "));eq(doc(2,"B"),docs.get(2L));rejects(IllegalArgumentException.class,()->PilotLab.importRows(docs,List.of("3|C","3|D")));eq(2,docs.size());}
            case "JP15" -> {
                Path file=Files.createTempFile("pilot-save-",".txt");
                try {
                    PilotLab.save(file,List.of(doc(2,"Tiếng Việt"),doc(1," Java ")));
                    eq(List.of("1|Java","2|Tiếng Việt"),Files.readAllLines(file));
                    var loaded=new LinkedHashMap<Long,PilotLab.Doc>();
                    PilotLab.importRows(loaded,Files.readAllLines(file));
                    eq(doc(2,"Tiếng Việt"),loaded.get(2L));
                    byte[] before=Files.readAllBytes(file);
                    for(String invalid:List.of("x|y","\nJava","Java\n","\rJava","Java\r","Ja\nva","Ja\rva","\r\nJava","Java\r\n")) {
                        // A valid row before the bad row must not cause a partial write.
                        rejects(IllegalArgumentException.class,()->PilotLab.save(file,List.of(doc(3,"Valid"),doc(4,invalid))));
                        eq(true,Arrays.equals(before,Files.readAllBytes(file)));
                    }
                } finally { Files.delete(file); }
            }
            case "JP16" -> {var summary=PilotLab.summarize(List.of(doc(1,"Java"),doc(2,"JUnit"),doc(3,"SQL")));eq(3,summary.count());eq(Map.of("J",2,"S",1),summary.initials());rejects(UnsupportedOperationException.class,()->summary.initials().put("X",1));eq(new PilotLab.Summary(0,Map.of()),PilotLab.summarize(List.of()));}
            case "JP17" -> {var input=new ArrayList<>(List.of(""," ","Java",""));eq(List.of("Java"),PilotLab.removeBlank(input));eq(4,input.size());eq(List.of(),PilotLab.removeBlank(List.of("","")));}
            case "JP18" -> {eq(4294967294L,PilotLab.sum(new int[]{Integer.MAX_VALUE,Integer.MAX_VALUE}));eq(-8L,PilotLab.sum(new int[]{-5,-3}));eq(0L,PilotLab.sum(new int[0]));}
            case "JP19" -> {var a=new PilotLab.Owned("an",1,"A");var b=new PilotLab.Owned("binh",1,"B");eq(List.of(a,b),PilotLab.distinctOwned(List.of(a,new PilotLab.Owned("an",1,"new"),b)));eq(List.of(),PilotLab.distinctOwned(List.of()));}
            case "JP20" -> {var box=new PilotLab.RevisionBox();var gate=new CyclicBarrier(2);var pool=Executors.newFixedThreadPool(2);try{Callable<Boolean> action=()->{gate.await(2,TimeUnit.SECONDS);return box.rename(0,"SQL");};var a=pool.submit(action);var b=pool.submit(action);eq(1,(a.get(3,TimeUnit.SECONDS)?1:0)+(b.get(3,TimeUnit.SECONDS)?1:0));eq(1L,box.version());eq("SQL",box.title());eq(false,box.rename(0,"stale"));rejects(IllegalArgumentException.class,()->box.rename(1," "));eq(1L,box.version());}finally{pool.shutdownNow();}}
            default -> throw new IllegalArgumentException("Unknown ID: "+id);
        }
        System.out.println("PASS "+id);
    }
    public static void main(String[] args) throws Exception { String selected=args.length==0?"all":args[0];if(selected.equals("all")){for(int i=1;i<=20;i++)check("JP%02d".formatted(i));}else for(String id:selected.split(","))check(id); }
}
