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
import secure_shop.backend.dto.auth.CustomUserDetails;
import secure_shop.backend.entities.User;
import secure_shop.backend.service.UserService;

import java.io.IOException;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserService userService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain)
            throws ServletException, IOException {

        // QUAN TRỌNG: BỎ QUA OPTIONS requests (CORS preflight)
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            log.debug("OPTIONS request detected - skipping JWT authentication");
            chain.doFilter(request, response);
            return;
        }

        // Skip JWT validation for public endpoints
        String path = request.getRequestURI();
        if (isPublicEndpoint(path)) {
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

            // Check if this is an access token (not refresh)
            String tokenType = decoded.getClaim("type").asString();
            if (tokenType != null && "refresh".equals(tokenType)) {
                log.warn("Refresh token used as access token");
                chain.doFilter(request, response);
                return;
            }

            String userId = decoded.getSubject();
            log.debug("Token verified for user ID: {}", userId);

            // Load user from database
            Optional<User> userOpt = userService.findById(UUID.fromString(userId));

            if (userOpt.isEmpty()) {
                log.warn("User not found for token subject: {}", userId);
                chain.doFilter(request, response);
                return;
            }

            User user = userOpt.get();

            // QUAN TRỌNG: Wrap User trong CustomUserDetails
            CustomUserDetails userDetails = new CustomUserDetails(user);

            // Create authentication token với CustomUserDetails
            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                            userDetails,  // Principal phải là CustomUserDetails
                            null,         // Credentials
                            userDetails.getAuthorities()  // Authorities từ CustomUserDetails
                    );

            authentication.setDetails(
                    new WebAuthenticationDetailsSource().buildDetails(request)
            );

            // Set authentication vào SecurityContext
            SecurityContextHolder.getContext().setAuthentication(authentication);

            log.debug("Successfully authenticated user: {} with authorities: {}",
                    user.getEmail(), userDetails.getAuthorities());

        } catch (Exception e) {
            log.error("JWT validation failed for path {}: {}", path, e.getMessage());
            // Invalid/expired token - continue without authentication
            // SecurityContext sẽ empty và request sẽ bị reject nếu cần authentication
        }

        chain.doFilter(request, response);
    }

    private boolean isPublicEndpoint(String path) {
        return path.startsWith("/api/auth/login") ||
                path.startsWith("/api/auth/register") ||
                path.startsWith("/api/auth/refresh") ||
                path.startsWith("/api/auth/logout") ||
                path.startsWith("/oauth2/") ||
                path.startsWith("/login/oauth2/") ||
                path.equals("/error");
    }
}