import java.util.*;
import java.nio.file.*;
import java.util.concurrent.*;

public class JAVA01 {
    static int half(int pages) { return pages / 2; }
    public static void main(String[] args) {
        int total=0;
        for(int pages:new int[]{2,5,6}) {
            int value=half(pages);
            total+=value;
            System.out.println(pages+":"+value+":"+total);
        }
    }
}
