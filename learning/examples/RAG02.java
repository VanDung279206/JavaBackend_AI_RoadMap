import java.util.*;
import java.nio.file.*;
import java.util.concurrent.*;

public class RAG02 {
    record Hit(String id,String owner,int score) {}
    public static void main(String[] args) {
        var hits=List.of(new Hit("private","binh",100),new Hit("allowed","an",80));
        var result=hits.stream().filter(h->h.owner().equals("an")).sorted(Comparator.comparingInt(Hit::score).reversed()).limit(1).map(Hit::id).toList();
        System.out.println(result);
        System.out.println(result.contains("allowed") ? "recall@1=1.0" : "recall@1=0.0");
    }
}
