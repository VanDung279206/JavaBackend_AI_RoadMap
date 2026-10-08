import java.util.*;
import java.nio.file.*;
import java.util.concurrent.*;

public class SPRING02 {
    record CreateDto(String title) {}
    record ResponseDto(long id,String title) {}
    public static void main(String[] args) {
        var request=new CreateDto(" Java ");
        String authenticatedOwner="an";
        if(request.title()==null || request.title().isBlank()) throw new IllegalArgumentException("title required");
        System.out.println(authenticatedOwner);
        System.out.println(new ResponseDto(1,request.title().strip()));
    }
}
