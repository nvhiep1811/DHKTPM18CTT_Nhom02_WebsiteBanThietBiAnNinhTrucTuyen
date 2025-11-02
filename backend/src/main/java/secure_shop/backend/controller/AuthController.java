package secure_shop.backend.controller;

import com.auth0.jwt.interfaces.DecodedJWT;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import secure_shop.backend.dto.UserProfileDTO;
import secure_shop.backend.dto.auth.AuthResponse;
import secure_shop.backend.dto.auth.ChangePasswordRequest;
import secure_shop.backend.config.security.CustomUserDetails;
import secure_shop.backend.dto.auth.LoginRequest;
import secure_shop.backend.entities.User;
import secure_shop.backend.exception.ForbiddenException;
import secure_shop.backend.exception.UnauthorizedException;
import secure_shop.backend.security.jwt.JwtService;
import secure_shop.backend.service.PasswordResetService;
import secure_shop.backend.service.UserService;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.time.Duration;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserService userService;
    private final PasswordResetService resetService;

    // ====== LOGIN ======
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest req, HttpServletResponse response) {
        // Xác thực tài khoản
        try {
            var token = new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword());
            authenticationManager.authenticate(token);
        } catch (BadCredentialsException ex) {
            throw new UnauthorizedException("Email hoặc mật khẩu không đúng");
        }

        // Lấy user sau khi xác thực
        User user = userService.findByEmail(req.getEmail())
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        if (!"local".equals(user.getProvider())) {
            throw new ForbiddenException("Vui lòng đăng nhập bằng " + user.getProvider());
        }

        if (user.getDeletedAt() != null) {
            throw new ForbiddenException("Tài khoản đã bị xoá");
        }

        if (!user.getEnabled()) {
            throw new ForbiddenException("Tài khoản chưa được kích hoạt hoặc đã bị vô hiệu hóa");
        }

        // Sinh token
        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        // Gắn refresh token vào cookie HttpOnly
        ResponseCookie cookie = ResponseCookie.from("refresh_token", refreshToken)
                .httpOnly(true)
                .secure(true)
                .sameSite("None")
                .path("/auth/refresh")
                .maxAge(Duration.ofSeconds(jwtService.getRefreshExpSeconds()))
                .build();
        response.addHeader("Set-Cookie", cookie.toString());

        return ResponseEntity.ok(new AuthResponse(accessToken, jwtService.getAccessExpSeconds()));
    }

    // ====== REFRESH TOKEN ======
    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(HttpServletRequest request, HttpServletResponse response) {
        String refreshToken = extractRefreshToken(request);
        if (refreshToken == null) {
            throw new UnauthorizedException("Không tìm thấy refresh token");
        }

        DecodedJWT decoded = jwtService.verify(refreshToken);
        if (!"refresh".equals(decoded.getClaim("type").asString())) {
            throw new UnauthorizedException("Refresh token không hợp lệ");
        }

        UUID userId = UUID.fromString(decoded.getSubject());
        User user = userService.findById(userId)
                .orElseThrow(() -> new UnauthorizedException("Không tìm thấy người dùng"));

        // Sinh token mới
        String newAccess = jwtService.generateAccessToken(user);
        String newRefresh = jwtService.generateRefreshToken(user);

        // Thay cookie refresh token
        ResponseCookie cookie = ResponseCookie.from("refresh_token", newRefresh)
                .httpOnly(true)
                .secure(true)
                .sameSite("None")
                .path("/auth/refresh")
                .maxAge(Duration.ofSeconds(jwtService.getRefreshExpSeconds()))
                .build();
        response.addHeader("Set-Cookie", cookie.toString());

        return ResponseEntity.ok(new AuthResponse(newAccess, jwtService.getAccessExpSeconds()));
    }

    // ====== LOGOUT ======
    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from("refresh_token", "")
                .httpOnly(true)
                .secure(true)
                .sameSite("None")
                .path("/auth/refresh")
                .maxAge(0)
                .build();
        response.addHeader("Set-Cookie", cookie.toString());

        return ResponseEntity.ok(Map.of("message", "Đăng xuất thành công"));
    }

    // ====== GET CURRENT USER ======
    @GetMapping("/me")
    public ResponseEntity<UserProfileDTO> getCurrentUser(@AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) {
            throw new UnauthorizedException("Bạn chưa đăng nhập");
        }

        User user = userDetails.getUser();
        UserProfileDTO dto = UserProfileDTO.builder()
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .phone(user.getPhone())
                .avatarUrl(user.getAvatarUrl())
                .role(user.getRole().name())
                .build();

        return ResponseEntity.ok(dto);
    }

    // ====== CHANGE PASSWORD ======
    @PostMapping("/change-password")
    public ResponseEntity<Map<String, String>> changePassword(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody ChangePasswordRequest req) {

        if (userDetails == null) {
            throw new UnauthorizedException("Bạn chưa đăng nhập");
        }

        userService.changePassword(userDetails.getUser(), req.getCurrentPassword(), req.getNewPassword());
        return ResponseEntity.ok(Map.of("message", "Đổi mật khẩu thành công"));
    }

    @PostMapping("/forgot-password")
    public String forgotPassword(@RequestParam String email) {
        resetService.sendResetLink(email);
        return "Liên kết khôi phục đã được gửi đến email của bạn.";
    }

    @GetMapping("/verify-token")
    public boolean verifyToken(@RequestParam String token) {
        return resetService.verifyToken(token);

    }

    @PostMapping("/reset-password")
    public String resetPassword(@RequestParam String token, @RequestParam String newPassword) {
        boolean ok = resetService.resetPassword(token, newPassword);
        return ok ? "Đổi mật khẩu thành công." : "Token không hợp lệ hoặc đã hết hạn.";
    }

    // ====== Helper ======
    private String extractRefreshToken(HttpServletRequest request) {
        if (request.getCookies() != null) {
            for (Cookie c : request.getCookies()) {
                if ("refresh_token".equals(c.getName())) return c.getValue();
            }
        }
        return null;
    }
}