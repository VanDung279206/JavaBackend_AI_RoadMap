import java.util.*;
import java.nio.file.*;
import java.util.concurrent.*;

public class SPRING01 {
    interface Repository { void save(String title); }
    static final class Service {
        private final Repository repository;
        Service(Repository repository) { this.repository=repository; }
        void create(String title) { if(title.isBlank()) throw new IllegalArgumentException(); repository.save(title.strip()); }
    }
    public static void main(String[] args) {
        Repository fake=title->System.out.println("Repository: "+title);
        Service service=new Service(fake);
        System.out.println("Controller"); service.create(" Java ");
    }
}
