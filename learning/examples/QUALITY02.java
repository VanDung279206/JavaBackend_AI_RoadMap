import java.util.*;
import java.nio.file.*;
import java.util.concurrent.*;

public class QUALITY02 {
    static int access(String caller,String owner) { if(caller==null) return 401; if(!caller.equals(owner)) return 403; return 200; }
    public static void main(String[] args) {
        System.out.println(access(null,"an"));
        System.out.println(access("binh","an"));
        System.out.println(access("an","an"));
    }
}
