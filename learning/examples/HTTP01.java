import java.util.*;
import java.nio.file.*;
import java.util.concurrent.*;

public class HTTP01 {
    record Request(String method,String path,String title) {}
    record Response(int status,String body) {}
    static Response handle(Request r) {
        if(!r.method().equals("POST") || !r.path().equals("/documents")) return new Response(404,"not found");
        if(r.title()==null || r.title().isBlank()) return new Response(400,"title required");
        return new Response(201,"created: "+r.title().strip());
    }
    public static void main(String[] args) {
        System.out.println(handle(new Request("POST","/documents"," ")));
        System.out.println(handle(new Request("POST","/documents","Java")));
    }
}
