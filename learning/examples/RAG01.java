import java.util.*;
import java.nio.file.*;
import java.util.concurrent.*;

public class RAG01 {
    public static void main(String[] args) {
        String text="ABCDEFGHI"; int size=4,overlap=1;
        if(size<=0 || overlap<0 || overlap>=size) throw new IllegalArgumentException();
        for(int start=0;start<text.length();) {
            int end=Math.min(text.length(),start+size);
            System.out.println(start+":"+end+":"+text.substring(start,end));
            if(end==text.length()) break;
            start=end-overlap;
        }
    }
}
