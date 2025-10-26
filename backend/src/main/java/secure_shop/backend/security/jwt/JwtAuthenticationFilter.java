package secure_shop.backend.security.jwt;

import com.auth0.jwt.interfaces.DecodedJWT;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import secure_shop.backend.entities.User;
import secure_shop.backend.service.UserService;

import java.io.IOException;
import java.util.Collections;
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

        // Skip JWT validation for public endpoints
        String path = request.getRequestURI();
        if (isPublicEndpoint(path)) {
            chain.doFilter(request, response);
            return;
        }

        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
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

            // Load user from database
            Optional<User> userOpt = userService.findById(UUID.fromString(userId));

            if (userOpt.isEmpty()) {
                log.warn("User not found for token subject: {}", userId);
                chain.doFilter(request, response);
                return;
            }

            User user = userOpt.get();

            // Get role from token claim
            String role = decoded.getClaim("role").asString();
            if (role == null) {
                role = "ROLE_USER";
            } else if (!role.startsWith("ROLE_")) {
                role = "ROLE_" + role;
            }

            // Create authentication token
            var authorities = Collections.singletonList(
                    new SimpleGrantedAuthority(role)
            );

            var authentication = new UsernamePasswordAuthenticationToken(
                    user,  // Principal (the User object)
                    null,  // Credentials
                    authorities
            );

            authentication.setDetails(
                    new WebAuthenticationDetailsSource().buildDetails(request)
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);

            log.debug("Successfully authenticated user: {} with role: {}",
                    user.getEmail(), role);

        } catch (Exception e) {
            log.error("JWT validation failed: {}", e.getMessage());
            // Invalid/expired token - continue without authentication
        }

        chain.doFilter(request, response);
    }

    private boolean isPublicEndpoint(String path) {
        return path.startsWith("/api/auth/") ||
                path.startsWith("/oauth2/") ||
                path.startsWith("/login/oauth2/") ||
                path.equals("/api/users"); // POST for registration
    }
}