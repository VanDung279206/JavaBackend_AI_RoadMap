import java.nio.file.*;
import java.util.*;
public class FoundationsChecks {
 static void eq(Object expected,Object actual){if(!Objects.equals(expected,actual))throw new AssertionError("expected="+expected+" actual="+actual);}
 static void rejects(Class<? extends Throwable> type,Throwing action)throws Exception{try{action.run();}catch(Throwable e){if(type.isInstance(e))return;throw e;}throw new AssertionError("expected="+type.getSimpleName()+" actual=no error");}
 interface Throwing{void run()throws Exception;}
 public static void main(String[] args)throws Exception{
  String id=args.length==0?"all":args[0];if(!Set.of("all","J01","J02","J03").contains(id))throw new IllegalArgumentException("Unknown ID");
  if(id.equals("all")||id.equals("J01")){
   eq(new FoundationsLab.Stats(4294967294L,Integer.MAX_VALUE,Integer.MAX_VALUE),FoundationsLab.stats(new int[]{Integer.MAX_VALUE,Integer.MAX_VALUE}));
   eq(new FoundationsLab.Stats(-8,-5,-3),FoundationsLab.stats(new int[]{-5,-3}));
   rejects(IllegalArgumentException.class,()->FoundationsLab.stats(new int[0]));rejects(IllegalArgumentException.class,()->FoundationsLab.stats(null));
  }
  if(id.equals("all")||id.equals("J02")){
   var a=new FoundationsLab.DocumentKey("an",1);var duplicate=new FoundationsLab.DocumentKey("an",1);var b=new FoundationsLab.DocumentKey("binh",1);
   eq(a,duplicate);eq(a.hashCode(),duplicate.hashCode());eq(false,a.equals(b));eq(false,a.equals(null));eq(false,a.equals("an"));
   eq(List.of(a,b),FoundationsLab.distinct(List.of(a,duplicate,b)));
   rejects(UnsupportedOperationException.class,()->FoundationsLab.distinct(List.of(1,2)).add(3));
   rejects(IllegalArgumentException.class,()->new FoundationsLab.DocumentKey(" ",1));rejects(IllegalArgumentException.class,()->new FoundationsLab.DocumentKey("an",0));
   rejects(NullPointerException.class,()->FoundationsLab.distinct(Arrays.asList(1,null)));
  }
  if(id.equals("all")||id.equals("J03")){
   Path file=Files.createTempFile("titles-",".txt");try{Files.writeString(file,"  Tiếng Việt  \n\nJava\r\n");eq(List.of("Tiếng Việt","Java"),FoundationsLab.readTitles(file));Files.writeString(file,"");eq(List.of(),FoundationsLab.readTitles(file));}finally{Files.delete(file);}
   rejects(java.io.IOException.class,()->FoundationsLab.readTitles(file));
  }
  System.out.println("PASS "+id);
 }
}
