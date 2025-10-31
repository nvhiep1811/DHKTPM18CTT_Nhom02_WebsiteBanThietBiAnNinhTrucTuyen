package secure_shop.backend.security.oauth2;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import secure_shop.backend.entities.User;
import secure_shop.backend.security.jwt.JwtService;
import secure_shop.backend.service.UserService;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    private final JwtService jwtService;
    private final UserService userService;

    @Value("${frontend.url}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {

        try {
            OAuth2AuthenticationToken oauthToken = (OAuth2AuthenticationToken) authentication;
            OAuth2User oauthUser = oauthToken.getPrincipal();
            Map<String, Object> attributes = oauthUser.getAttributes();
            String provider = oauthToken.getAuthorizedClientRegistrationId(); // google, facebook

            // Extract user info
            String email = (String) attributes.get("email");
            String name = (String) attributes.get("name");
            String avatar = extractAvatar(attributes, provider);

            if (email == null || email.isBlank()) {
                log.error("OAuth login failed: No email provided");
                redirectToError(response, "No email provided by OAuth provider");
                return;
            }

            // Find or create user
            User user = userService.findByEmail(email).orElseGet(() -> {
                User newUser = new User();
                newUser.setEmail(email);
                newUser.setName(name != null ? name : email);
                newUser.setAvatarUrl(avatar);
                newUser.setProvider(provider); // Set provider (google, facebook)
                return userService.createUser(newUser);
            });

            // Update provider if not set
            if (user.getProvider() == null || user.getProvider().isBlank()) {
                user.setProvider(provider);
                userService.updateUser(user.getId(), user);
            }

            // Generate tokens
            String accessToken = jwtService.generateAccessToken(user);
            String refreshToken = jwtService.generateRefreshToken(user);

            // Set refresh token as HttpOnly secure cookie
            ResponseCookie cookie = ResponseCookie.from("refresh_token", refreshToken)
                    .httpOnly(true)
                    .secure(true) // HTTPS only in production
                    .sameSite("Lax") // Changed from "None" for better security
                    .path("/")
                    .maxAge(Duration.ofSeconds(jwtService.getRefreshExpSeconds()))
                    .build();
            response.addHeader("Set-Cookie", cookie.toString());

            String redirectUrl = String.format("%s/oauth2/redirect?access_token=%s&expires_in=%d",
                    frontendUrl,
                    URLEncoder.encode(accessToken, StandardCharsets.UTF_8),
                    jwtService.getAccessExpSeconds());
            response.sendRedirect(redirectUrl);
        } catch (Exception e) {
            log.error("OAuth login error: ", e);
            redirectToError(response, "Authentication failed");
        }
    }

    private String extractAvatar(Map<String, Object> attributes, String provider) {
        Object pictureObj = attributes.get("picture");

        if (pictureObj == null) {
            // Try other common avatar field names
            pictureObj = attributes.get("avatar_url");
            if (pictureObj == null) {
                pictureObj = attributes.get("image");
            }
        }

        if (pictureObj == null) {
            return null;
        }

        // Handle string URL
        if (pictureObj instanceof String s) {
            return s;
        }

        // Handle Facebook picture format: {data: {url: "..."}}
        if (pictureObj instanceof Map<?, ?> picMap) {
            Object dataObj = picMap.get("data");
            if (dataObj instanceof Map<?, ?> dataMap) {
                Object urlObj = dataMap.get("url");
                if (urlObj instanceof String s) {
                    return s;
                }
            }

            // Try direct url field in map
            Object urlObj = picMap.get("url");
            if (urlObj instanceof String s) {
                return s;
            }
        }

        return null;
    }

    private void redirectToError(HttpServletResponse response, String error) throws IOException {
        String redirectUrl = String.format("%s/oauth2/redirect?error=%s",
                frontendUrl,
                URLEncoder.encode(error, StandardCharsets.UTF_8));
        response.sendRedirect(redirectUrl);
    }
}