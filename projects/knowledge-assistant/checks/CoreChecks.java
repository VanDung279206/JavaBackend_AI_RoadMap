import vn.roadmap.knowledge.TextRules;
import java.util.*;
public class CoreChecks {
    static int checks;
    static void ok(boolean b){checks++;if(!b)throw new AssertionError("core check "+checks);}
    public static void main(String[] args){
        ok(TextRules.title("  Java\t AI  ").equals("Java AI"));
        ok(TextRules.chunks("a b c d e f g",4,1).equals(List.of("a b c d","d e f g")));
        ok(TextRules.chunks("",4,1).isEmpty());
        ok(TextRules.lexicalScore("Java SQL","Java uses classes")==.5);
        ok(TextRules.lexicalScore("volcano","Java uses classes")==0);
        ok(TextRules.excerpt("A😀B",2).equals("A😀"));
        ok(TextRules.vector(new float[]{1,0},2).equals("[1.0,0.0]"));
        try{TextRules.vector(new float[]{0,0},2);throw new AssertionError();}catch(IllegalArgumentException e){checks++;}
        try{TextRules.vector(new float[]{1},2);throw new AssertionError();}catch(IllegalArgumentException e){checks++;}
        ok(TextRules.citationsAllowed(List.of("A"),Set.of("A","B")));
        ok(!TextRules.citationsAllowed(List.of("X"),Set.of("A","B")));
        ok(!TextRules.citationsAllowed(List.of("A","A"),Set.of("A")));
        ok(!TextRules.citationsAllowed(List.of(),Set.of("A")));
        System.out.println("PASS: "+checks+" application core checks (no Spring runtime)");
    }
}
