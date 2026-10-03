package vn.roadmap.knowledge;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.slf4j.MDC;
import java.io.IOException;
import java.util.UUID;
import java.util.concurrent.atomic.LongAdder;

@Component @Order(Ordered.HIGHEST_PRECEDENCE)
public class RequestMetricsFilter extends OncePerRequestFilter {
 private final LongAdder requests=new LongAdder(),errors=new LongAdder(),nanos=new LongAdder();
 public record Snapshot(long requests,long errors,long totalNanos) {}
 public Snapshot snapshot(){return new Snapshot(requests.sum(),errors.sum(),nanos.sum());}
 @Override protected void doFilterInternal(HttpServletRequest request,HttpServletResponse response,FilterChain chain)throws ServletException,IOException {
  String supplied=request.getHeader("X-Request-ID");
  String id=supplied!=null&&supplied.matches("[A-Za-z0-9._-]{1,64}")?supplied:UUID.randomUUID().toString();
  response.setHeader("X-Request-ID",id);MDC.put("requestId",id);long start=System.nanoTime();boolean failed=false;
  try{chain.doFilter(request,response);}catch(ServletException|IOException|RuntimeException e){failed=true;throw e;}
  finally{requests.increment();if(failed||response.getStatus()>=500)errors.increment();nanos.add(System.nanoTime()-start);MDC.remove("requestId");}
 }
}
