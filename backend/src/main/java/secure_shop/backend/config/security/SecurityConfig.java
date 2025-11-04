package secure_shop.backend.config.security;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import secure_shop.backend.exception.JwtAuthenticationEntryPoint;
import secure_shop.backend.security.CustomAccessDeniedHandler;
import secure_shop.backend.security.jwt.JwtAuthenticationFilter;
import secure_shop.backend.security.oauth2.OAuth2FailureHandler;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableAsync
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final AuthenticationProvider authenticationProvider;
    private final AuthenticationSuccessHandler oauthSuccessHandler;
    private final OAuth2FailureHandler oauthFailureHandler;
    private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;
    private final CustomAccessDeniedHandler customAccessDeniedHandler;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // 1. CORS - PHẢI ĐẦU TIÊN
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // 2. CSRF
                .csrf(csrf -> csrf.disable())

                // 3. Session Management
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // 4. Authorization Rules - THỨ TỰ QUAN TRỌNG
                .authorizeHttpRequests(auth -> auth
                        // OPTIONS requests - CHO PHÉP TẤT CẢ (CORS preflight)
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // Login/out - Register endpoints - NO authentication required
                        .requestMatchers(
                                "/api/auth/login",
                                "/api/auth/refresh",
                                "/api/auth/logout",
                                "/api/auth/register",
                                "/api/auth/verify-email",
                                "/api/auth/resend-verification",
                                "/oauth2/**",
                                "/login/oauth2/**",
                                "/error"
                        ).permitAll()
                        .requestMatchers("/api/auth/me").authenticated()
                        // Reset password endpoints - NO authentication required
                        .requestMatchers(
                                "/api/auth/forgot-password",
                                "/api/auth/verify-token",
                                "/api/auth/reset-password"
                        ).permitAll()

                        // User endpoints require authentication
                        .requestMatchers("/api/users/me/**").authenticated()
                        .requestMatchers("/api/users/**").hasRole("ADMIN")

                        // Address endpoints - AUTHENTICATED
                        .requestMatchers("/api/addresses/**").authenticated()

                        // Ticket endpoints
                        .requestMatchers("/api/tickets/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/tickets/**").authenticated()

                        // Article endpoints
                        .requestMatchers(HttpMethod.GET, "/api/articles", "/api/articles/**").permitAll()
                        .requestMatchers("/api/articles/**").hasRole("ADMIN")

                        // Brand endpoints
                        .requestMatchers(HttpMethod.GET, "/api/brands", "/api/brands/**").permitAll()
                        .requestMatchers("/api/brands/**").hasRole("ADMIN")

                        // Category endpoints
                        .requestMatchers("/api/categories", "/api/categories/active").permitAll()
                        .requestMatchers("/api/categories/**").hasRole("ADMIN")

                        // Inventory endpoints
                        .requestMatchers(HttpMethod.GET, "/api/inventories/**").permitAll()
                        .requestMatchers("/api/inventories/**").hasRole("ADMIN")

                        // Media endpoints
                        .requestMatchers("/api/media/**").permitAll()

                        // Default: require authentication
                        .anyRequest().authenticated()
                )

                // 5. OAuth2 Login Configuration
                .oauth2Login(oauth2 -> oauth2
                        .authorizationEndpoint(authorization -> authorization
                                .baseUri("/oauth2/authorize"))
                        .redirectionEndpoint(redirection -> redirection
                                .baseUri("/login/oauth2/code/*"))
                        .successHandler(oauthSuccessHandler)
                        .failureHandler(oauthFailureHandler)
                        .permitAll()
                )

                // 6. Disable form login to prevent redirect loop
                .formLogin(form -> form.disable())

                // 7. Disable HTTP Basic
                .httpBasic(basic -> basic.disable())

                // 8. Exception Handling - TRẢ JSON thay vì redirect
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint(jwtAuthenticationEntryPoint)
                        .accessDeniedHandler(customAccessDeniedHandler)
                )

                // 9. Add JWT filter
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                .authenticationProvider(authenticationProvider);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Allowed origins
        configuration.setAllowedOrigins(List.of("http://localhost:5173", "http://localhost:3000"));

        // Allowed methods
        configuration.setAllowedMethods(Arrays.asList(
                "GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"
        ));

        // Allowed headers
        configuration.setAllowedHeaders(List.of("*"));

        // Allow credentials
        configuration.setAllowCredentials(true);

        // Exposed headers
        configuration.setExposedHeaders(Arrays.asList("Authorization", "Set-Cookie"));

        // Cache preflight for 1 hour
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config)
            throws Exception {
        return config.getAuthenticationManager();
    }
}