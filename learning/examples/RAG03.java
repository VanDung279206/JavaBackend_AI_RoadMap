import java.util.*;
import java.nio.file.*;
import java.util.concurrent.*;

public class RAG03 {
    static String verify(Set<String> retrieved,String citation) {
        if(retrieved.isEmpty()) return "insufficient data";
        return retrieved.contains(citation) ? "citation allowed" : "reject unknown source";
    }
    public static void main(String[] args) {
        System.out.println(verify(Set.of("d1:c1"),"d1:c1"));
        System.out.println(verify(Set.of("d1:c1"),"d9:c2"));
        System.out.println(verify(Set.of(),"d1:c1"));
    }
}
