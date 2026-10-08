import java.util.*;
import java.nio.file.*;
import java.util.concurrent.*;

public class JAVA05 {
    public static void main(String[] args) {
        var counts=new LinkedHashMap<String,Integer>();
        for(String word:List.of("java","sql","java")) counts.merge(word,1,Integer::sum);
        System.out.println(counts);
        counts.put("java",9);
        System.out.println(counts.get("java"));
    }
}
