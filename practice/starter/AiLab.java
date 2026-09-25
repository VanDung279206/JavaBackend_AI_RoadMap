import java.util.*;
public final class AiLab {
    public record Prompt(String system, String user) {}
    public record Summary(String title, List<String> bullets) {}
    public record Budget(long inputTokens, long maxOutputTokens, long contextLimit) {}
    public interface Gateway { Summary summarize(Prompt p); }
    public static final class UpstreamFailure extends RuntimeException {
        public final int status;
        public UpstreamFailure(int status) { this.status=status; }
    }
    public static Prompt prompt(String document) { throw new UnsupportedOperationException("TODO P5.1"); }
    public static boolean fits(Budget b) { throw new UnsupportedOperationException("TODO P5.2"); }
    public static Summary validate(Summary s) { throw new UnsupportedOperationException("TODO P5.3"); }
    public static Summary summarizeWithOneRetry(Gateway g, Prompt p) {
        throw new UnsupportedOperationException("TODO P5.4");
    }
}
