import java.util.*;
import java.nio.file.*;
import java.util.concurrent.*;

public class JAVA03 {
    record Document(long id,String title) {
        Document { if(id<=0 || title==null || title.isBlank()) throw new IllegalArgumentException("invalid document"); title=title.strip(); }
    }
    public static void main(String[] args) {
        var doc=new Document(1," Java ");
        System.out.println(doc.id()+":"+doc.title());
        try { new Document(0," "); } catch(IllegalArgumentException e) { System.out.println(e.getMessage()); }
    }
}
