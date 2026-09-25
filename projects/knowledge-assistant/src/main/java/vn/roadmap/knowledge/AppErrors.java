package vn.roadmap.knowledge;

public final class AppErrors {
    private AppErrors() {}
    public static final class Stale extends RuntimeException {}
    public static final class Missing extends RuntimeException {}
    public static final class Upstream extends RuntimeException {
        public Upstream(String message){super(message);}
        public Upstream(String message,Throwable cause){super(message,cause);}
    }
}
