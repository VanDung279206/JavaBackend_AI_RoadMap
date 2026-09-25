package vn.roadmap.knowledge;

import org.springframework.context.annotation.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.*;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import static org.springframework.security.config.Customizer.withDefaults;
@Configuration
public class SecurityConfig {
    @Bean PasswordEncoder encoder(){return new BCryptPasswordEncoder();}
    @Bean UserDetailsService users(@Value("${app.an-password}") String an,@Value("${app.binh-password}") String binh,PasswordEncoder e){
        if(an.isBlank()||binh.isBlank())throw new IllegalArgumentException("demo user passwords required");
        return new InMemoryUserDetailsManager(User.withUsername("an").password(e.encode(an)).roles("USER").build(),User.withUsername("binh").password(e.encode(binh)).roles("USER").build());
    }
    @Bean SecurityFilterChain security(HttpSecurity http)throws Exception {
        // CLI-only local API. A browser client requires its own CSRF/auth design.
        return http.csrf(c->c.disable()).sessionManagement(s->s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(a->a.requestMatchers("/health").permitAll().anyRequest().authenticated())
            .httpBasic(withDefaults()).build();
    }
}
