import java.util.*;
import java.nio.file.*;
import java.util.concurrent.*;

public class JAVA02 {
    static final class Shelf { final List<String> titles=new ArrayList<>(); }
    public static void main(String[] args) {
        Shelf first=new Shelf();
        Shelf second=first;
        second.titles.add("Java");
        Shelf independent=new Shelf();
        System.out.println(first.titles.size()+":"+second.titles.size()+":"+independent.titles.size());
    }
}
