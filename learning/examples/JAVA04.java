import java.util.*;
import java.nio.file.*;
import java.util.concurrent.*;

public class JAVA04 {
    public static void main(String[] args) {
        var ids=new ArrayList<>(List.of(10L,20L,30L));
        ids.remove(1);
        ids.add(40L);
        System.out.println(ids);
        System.out.println(ids.contains(20L));
    }
}
