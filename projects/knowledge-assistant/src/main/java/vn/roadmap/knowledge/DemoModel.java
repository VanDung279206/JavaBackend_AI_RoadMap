package vn.roadmap.knowledge;

import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import java.util.List;
import static vn.roadmap.knowledge.ApiTypes.*;
@Component @Profile("!real-ai")
public class DemoModel implements ModelGateway {
    public Summary summarize(DocumentEntity d){return new Summary(d.title,List.of(TextRules.excerpt(d.content,280)));}
    public GeneratedAnswer answer(String question,List<Source> sources){var first=sources.get(0);return new GeneratedAnswer(first.text(),List.of(first.id()),false);}
    public String mode(){return "extractive-demo";}
}
