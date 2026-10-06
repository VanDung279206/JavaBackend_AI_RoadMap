import java.util.*;
import java.nio.file.*;
import java.util.concurrent.*;

public class JAVA08 {
    public static void main(String[] args) throws Exception {
        Path file=Files.createTempFile("lesson-",".txt");
        try {
            Files.writeString(file," Tiếng Việt \n\nJava\n");
            try(var lines=Files.lines(file)) { System.out.println(lines.map(String::strip).filter(s->!s.isEmpty()).toList()); }
        } finally { Files.delete(file); }
        try { Files.readString(file); } catch(java.io.IOException e) { System.out.println("missing file"); }
    }
}
