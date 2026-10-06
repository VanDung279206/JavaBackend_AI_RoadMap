import java.util.*;
import java.nio.file.*;
import java.util.concurrent.*;

public class QUALITY01 {
    static long validate(long id) { if(id<=0) throw new IllegalArgumentException(); return id; }
    public static void main(String[] args) {
        if(validate(1)!=1) throw new AssertionError("valid");
        for(long id:new long[]{0,-1}) {
            boolean rejected=false;
            try { validate(id); } catch(IllegalArgumentException e) { rejected=true; }
            if(!rejected) throw new AssertionError("boundary");
        }
        System.out.println("3 cases passed");
    }
}
