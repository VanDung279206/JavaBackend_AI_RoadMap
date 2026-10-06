import java.util.*;
import java.nio.file.*;
import java.util.concurrent.*;

public class AI02 {
    record Output(String summary,String status) {}
    static boolean valid(Output out) { return out!=null && out.summary()!=null && !out.summary().isBlank() && Set.of("ok","insufficient").contains(out.status()); }
    public static void main(String[] args) {
        System.out.println(valid(new Output("Java basics","ok")));
        System.out.println(valid(new Output(" ","ok")));
        System.out.println(valid(new Output("Java","unknown")));
    }
}
