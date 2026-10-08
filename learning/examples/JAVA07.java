import java.util.*;
import java.nio.file.*;
import java.util.concurrent.*;

public class JAVA07 {
    public static void main(String[] args) {
        var internal=new ArrayList<>(List.of("Java"));
        var snapshot=List.copyOf(internal);
        internal.add("SQL");
        System.out.println(snapshot);
        try { snapshot.clear(); } catch(UnsupportedOperationException e) { System.out.println("read-only"); }
        System.out.println(internal);
    }
}
