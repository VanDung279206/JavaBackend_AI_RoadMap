import java.util.*;
import java.nio.file.*;
import java.util.concurrent.*;

public class JAVA06 {
    static void add(Map<Long,String> docs,long id,String title) {
        if(id<=0 || title==null || title.isBlank()) throw new IllegalArgumentException("invalid");
        if(docs.containsKey(id)) throw new IllegalArgumentException("duplicate");
        docs.put(id,title.strip());
    }
    public static void main(String[] args) {
        var docs=new LinkedHashMap<Long,String>(); add(docs,1,"Java");
        try { add(docs,1,"SQL"); } catch(IllegalArgumentException e) { System.out.println(e.getMessage()); }
        System.out.println(docs);
    }
}
