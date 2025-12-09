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

    // Các endpoint thực sự public không cần xác thực (chủ yếu là auth endpoints)
    private static final List<String> ALWAYS_PUBLIC_PATHS = List.of(
            "/api/auth/login",
            "/api/auth/register",
            "/api/auth/refresh",
            "/api/auth/verify-email",
            "/api/auth/resend-verification",
            "/api/auth/forgot-password",
            "/api/auth/verify-token",
            "/api/auth/reset-password",
            "/oauth2/",
            "/login/oauth2/",
            "/error",
            "/api/chat/ask"
    );

    // Các endpoint cho phép GET public nhưng POST/PUT/DELETE cần admin
    private static final List<String> PUBLIC_READ_ONLY_PATHS = List.of(
            "/api/articles",
            "/api/brands",
            "/api/categories",
            "/api/inventories",
            "/api/media/product/",
            "/api/products",
            "/api/reviews/product/",
            "/api/discounts/active",
            "/api/discounts/code/"
    );

    private boolean isPublicEndpoint(String path, String method) {
        // Luôn public cho mọi method
        if (ALWAYS_PUBLIC_PATHS.stream().anyMatch(path::startsWith)) {
            return true;
        }
        
        // Chỉ public cho GET method
        if ("GET".equalsIgnoreCase(method)) {
            return PUBLIC_READ_ONLY_PATHS.stream().anyMatch(path::startsWith);
        }
        
        return false;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain)
            throws ServletException, IOException {

        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            chain.doFilter(request, response);
            return;
        }

        String path = request.getRequestURI();
        String method = request.getMethod();
        log.debug("Processing {} {}", method, path);

        // Kiểm tra endpoint public dựa trên path VÀ method
        if (isPublicEndpoint(path, method)) {
            log.debug("Public endpoint - skipping JWT: {} {}", method, path);
            chain.doFilter(request, response);
            return;
        }

        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            log.debug("No Bearer token - continuing without auth");
            chain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);

        try {
            DecodedJWT decoded = jwtService.verify(token);
            String tokenType = decoded.getClaim("type").asString();
            if ("refresh".equals(tokenType)) {
                log.warn("Refresh token used in access context");
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.getWriter().write("{\"error\": \"Use refresh endpoint\"}");
                return;
            }

            UUID userId = UUID.fromString(decoded.getSubject());
            User user = userService.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            CustomUserDetails userDetails = new CustomUserDetails(user);
            UsernamePasswordAuthenticationToken auth =
                    new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
            auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

            SecurityContextHolder.getContext().setAuthentication(auth);
            log.debug("Authenticated user: {}", user.getEmail());

        } catch (Exception e) {
            log.error("JWT authentication failed: {}", e.getMessage());
            SecurityContextHolder.clearContext();
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\": \"Invalid token\"}");
            return; // NGĂN CHẶN TIẾP TỤC
        }

        chain.doFilter(request, response);
    }
}