import org.junit.jupiter.api.DynamicTest;
import org.junit.jupiter.api.TestFactory;
import java.util.stream.Stream;
public class JunitPracticeTest {
    @TestFactory Stream<DynamicTest> contracts() {
        String selected=System.getProperty("exercise","all");
        if(!selected.equals("all")&&!PracticeChecks.ids().contains(selected))throw new IllegalArgumentException("Unknown exercise ID: "+selected);
        return PracticeChecks.ids().stream().filter(id->selected.equals("all")||id.equals(selected))
            .map(id->DynamicTest.dynamicTest(id,()->PracticeChecks.runOne(id)));
    }
}
