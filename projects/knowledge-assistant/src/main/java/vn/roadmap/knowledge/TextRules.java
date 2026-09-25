package vn.roadmap.knowledge;

import java.util.*;
/** Dependency-free text rules. These words are not model tokens. */
public final class TextRules {
    private TextRules() {}
    public static String title(String raw) {
        if(raw==null||raw.isBlank())throw new IllegalArgumentException("title required");
        String t=raw.strip().replaceAll("\\s+"," ");
        if(t.length()>120)throw new IllegalArgumentException("title too long");return t;
    }
    public static List<String> chunks(String text,int size,int overlap) {
        if(text==null||size<1||overlap<0||overlap>=size)throw new IllegalArgumentException("invalid chunk input");
        if(text.isBlank())return List.of();String[] words=text.strip().split("\\s+");List<String> out=new ArrayList<>();
        for(int start=0;start<words.length;start+=size-overlap) {
            int end=(int)Math.min((long)start+size,words.length);
            out.add(String.join(" ",Arrays.copyOfRange(words,start,end)));if(end==words.length)break;
        }
        return List.copyOf(out);
    }
    public static Set<String> terms(String text) {
        Set<String> out=new HashSet<>();for(String t:text.toLowerCase(Locale.ROOT).split("[^\\p{L}\\p{N}]+"))if(!t.isBlank())out.add(t);return out;
    }
    public static double lexicalScore(String query,String text) {
        Set<String> q=terms(query);if(q.isEmpty())return 0;Set<String> t=terms(text);
        return (double)q.stream().filter(t::contains).count()/q.size();
    }
    public static String excerpt(String text,int max) {
        if(max<1)throw new IllegalArgumentException();String s=text.strip();
        int end=s.offsetByCodePoints(0,Math.min(max,s.codePointCount(0,s.length())));return s.substring(0,end);
    }
    public static String vector(float[] a,int dimensions) {
        if(dimensions<1||a.length!=dimensions)throw new IllegalArgumentException("embedding dimension mismatch");
        double norm=0;StringJoiner out=new StringJoiner(",","[","]");
        for(float v:a){if(!Float.isFinite(v))throw new IllegalArgumentException("non-finite embedding");norm=Math.hypot(norm,v);out.add(Float.toString(v));}
        if(norm==0)throw new IllegalArgumentException("zero embedding");return out.toString();
    }
    public static boolean citationsAllowed(List<String> cited,Set<String> retrieved) {
        return cited!=null&&!cited.isEmpty()&&new HashSet<>(cited).size()==cited.size()&&cited.stream().allMatch(retrieved::contains);
    }
}
