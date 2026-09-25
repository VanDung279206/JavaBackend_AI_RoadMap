package vn.roadmap.knowledge;

import org.springframework.context.annotation.*;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.boot.web.client.RestClientCustomizer;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import java.net.http.HttpClient;
import java.time.Duration;
@Configuration @Profile("real-ai")
public class RealAiConfig {
    @Bean ChatClient chat(ChatClient.Builder builder){return builder.build();}
    @Bean RestClientCustomizer modelTimeouts(){return builder->{
        var client=HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5)).build();
        var factory=new JdkClientHttpRequestFactory(client);factory.setReadTimeout(Duration.ofSeconds(30));builder.requestFactory(factory);
    };}
}
