package vn.roadmap.knowledge;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.*;
import org.slf4j.MDC;
import static org.junit.jupiter.api.Assertions.*;
class RequestMetricsTest {
 @Test void propagatesIdCountsFailuresAndCleansThread()throws Exception{
  var filter=new RequestMetricsFilter();var request=new MockHttpServletRequest();request.addHeader("X-Request-ID","lesson-123");var response=new MockHttpServletResponse();
  filter.doFilter(request,response,(r,s)->{assertEquals("lesson-123",MDC.get("requestId"));((jakarta.servlet.http.HttpServletResponse)s).setStatus(500);});
  assertEquals("lesson-123",response.getHeader("X-Request-ID"));assertNull(MDC.get("requestId"));assertEquals(1,filter.snapshot().requests());assertEquals(1,filter.snapshot().errors());
 }
 @Test void untrustedIdCannotInjectLogLines()throws Exception{
  var request=new MockHttpServletRequest();request.addHeader("X-Request-ID","a\r\nspoof");var response=new MockHttpServletResponse();
  new RequestMetricsFilter().doFilter(request,response,(r,s)->{});
  var actual=response.getHeader("X-Request-ID");assertNotNull(actual,"Missing generated request ID");
  assertTrue(actual.matches("[a-f0-9-]{36}"));assertNull(MDC.get("requestId"));
 }
}
