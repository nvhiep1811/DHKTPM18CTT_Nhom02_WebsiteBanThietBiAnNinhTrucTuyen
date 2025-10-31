package secure_shop.backend.security.oauth2;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationFailureHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Slf4j
@Component
public class OAuth2FailureHandler extends SimpleUrlAuthenticationFailureHandler {

    @Override
    public void onAuthenticationFailure(
            HttpServletRequest request,
            HttpServletResponse response,
            AuthenticationException exception) throws IOException {

        log.warn("OAuth2 login failed: {}", exception.getMessage());

        // URL frontend để redirect (thay bằng domain thật nếu cần)
        String frontendUrl = "http://localhost:5173/login";

        // Gửi thông báo lỗi dạng query param (frontend có thể đọc để hiển thị)
        String redirectUrl = String.format(
                "%s?oauthError=%s",
                frontendUrl,
                URLEncoder.encode("Đăng nhập OAuth thất bại hoặc bị hủy", StandardCharsets.UTF_8)
        );

        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }
}