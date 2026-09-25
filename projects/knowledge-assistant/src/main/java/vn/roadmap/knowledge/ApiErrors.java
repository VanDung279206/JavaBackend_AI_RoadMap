package vn.roadmap.knowledge;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.*;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
@RestControllerAdvice
public class ApiErrors {
    @ExceptionHandler(AppErrors.Missing.class) ProblemDetail missing(){return ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND,"Document not found");}
    @ExceptionHandler({IllegalArgumentException.class,MethodArgumentNotValidException.class,HttpMessageNotReadableException.class,MethodArgumentTypeMismatchException.class})
    ProblemDetail bad(Exception e){return ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST,"Invalid request; check fields and pagination");}
    @ExceptionHandler({ObjectOptimisticLockingFailureException.class,AppErrors.Stale.class}) ProblemDetail conflict(){return ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT,"Document changed; reload before retrying");}
    @ExceptionHandler(AppErrors.Upstream.class) ProblemDetail upstream(){return ProblemDetail.forStatusAndDetail(HttpStatus.BAD_GATEWAY,"Model request failed or returned invalid output");}
}
