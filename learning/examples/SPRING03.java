import java.util.*;
import java.nio.file.*;
import java.util.concurrent.*;

public class SPRING03 {
    record Row(String title,long version) {}
    public static void main(String[] args) {
        var database=new HashMap<Long,Row>(); database.put(1L,new Row("Java",0));
        long expected=0;
        Row current=database.get(1L);
        if(current.version()==expected) database.put(1L,new Row("SQL",current.version()+1));
        System.out.println(database.get(1L));
        System.out.println(database.get(1L).version()==expected ? "update" : "409 conflict");
    }
}
