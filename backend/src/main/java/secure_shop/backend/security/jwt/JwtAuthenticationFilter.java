package secure_shop.backend.security.jwt;

import com.auth0.jwt.interfaces.DecodedJWT;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import secure_shop.backend.config.security.CustomUserDetails;
import secure_shop.backend.entities.User;
import secure_shop.backend.service.UserService;

import java.io.IOException;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserService userService;

    private static final List<String> PUBLIC_PATH_PREFIXES = List.of(
            // 🔐 AUTH - PUBLIC ENDPOINTS
            "/api/auth/login",
            "/api/auth/register",
            "/api/auth/refresh",
            "/api/auth/logout",
            "/api/auth/verify-email",
            "/api/auth/resend-verification",
            "/api/auth/forgot-password",
            "/api/auth/verify-token",
            "/api/auth/reset-password",

            // 📄 ARTICLES - PUBLIC VIEW
            "/api/articles",
            "/api/articles/",

            // 🏷️ BRANDS - PUBLIC VIEW
            "/api/brands",
            "/api/brands/",

            // 📂 CATEGORIES - PUBLIC VIEW
            "/api/categories",
            "/api/categories/active",
            "/api/categories/",

            // 🧮 INVENTORIES - PUBLIC VIEW
            "/api/inventories",
            "/api/inventories/",

            // 🖼️ MEDIA - PUBLIC (upload/view handled by Supabase)
            "/api/media",
            "/api/media/",

            // 🛒 PRODUCTS - PUBLIC GET
            "/api/products",
            "/api/products/",
            "/api/products/summary/",

            // 💬 REVIEWS - PUBLIC GET (product reviews)
            "/api/reviews",
            "/api/reviews/product/",

            // 🌐 OAUTH & ERROR
            "/oauth2/",
            "/login/oauth2/",
            "/error"
    );

    private boolean isPublicEndpoint(String path) {
        return PUBLIC_PATH_PREFIXES.stream().anyMatch(path::startsWith);
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain)
            throws ServletException, IOException {

        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            log.debug("OPTIONS request detected - skipping JWT authentication");
            chain.doFilter(request, response);
            return;
        }

        String path = request.getRequestURI();
        log.debug("JwtAuthFilter processing path={}, isPublic={}", path, isPublicEndpoint(path));

        if (isPublicEndpoint(path) && "GET".equalsIgnoreCase(request.getMethod())) {
            log.debug("Public endpoint: {} - skipping JWT authentication", path);
            chain.doFilter(request, response);
            return;
        }

        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            log.debug("No Bearer token found in Authorization header for path: {}", path);
            chain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);

        try {
            DecodedJWT decoded = jwtService.verify(token);

            String tokenType = decoded.getClaim("type").asString();
            if ("refresh".equals(tokenType)) {
                log.warn("Refresh token used as access token");
                chain.doFilter(request, response);
                return;
            }

            String userId = decoded.getSubject();
            log.debug("Token verified for user ID: {}", userId);

            Optional<User> userOpt = userService.findById(UUID.fromString(userId));
            if (userOpt.isEmpty()) {
                log.warn("User not found for token subject: {}", userId);
                chain.doFilter(request, response);
                return;
            }

            User user = userOpt.get();
            CustomUserDetails userDetails = new CustomUserDetails(user);

            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

            if (SecurityContextHolder.getContext().getAuthentication() == null) {
                SecurityContextHolder.getContext().setAuthentication(authentication);
                log.debug("Authenticated user {} set into SecurityContext", user.getEmail());
            } else {
                log.debug("SecurityContext already contains authentication, skipping set");
            }

        } catch (Exception e) {
            log.error("JWT validation failed for path {}: {}", path, e.getMessage());
            SecurityContextHolder.clearContext();
        }

        chain.doFilter(request, response);
    }
}