package secure_shop.backend.controller;

import com.auth0.jwt.interfaces.DecodedJWT;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import secure_shop.backend.dto.UserProfileDTO;
import secure_shop.backend.dto.auth.AuthResponse;
import secure_shop.backend.dto.auth.CustomUserDetails;
import secure_shop.backend.dto.auth.LoginRequest;
import secure_shop.backend.entities.User;
import secure_shop.backend.security.jwt.JwtService;
import secure_shop.backend.service.UserService;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.time.Duration;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserService userService;

    // ====== LOGIN ======
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req, HttpServletResponse response) {
        try {
            var token = new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword());
            authenticationManager.authenticate(token);
        } catch (BadCredentialsException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
        }

        // load user (after successful auth)
        Optional<User> opt = userService.findByEmail(req.getEmail());
        if (opt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not found");
        }
        User user = opt.get();

        // generate tokens
        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        // set refresh token as HttpOnly cookie
        ResponseCookie cookie = ResponseCookie.from("refresh_token", refreshToken)
                .httpOnly(true)
                .secure(true) // set true in prod (HTTPS). Set false for local http dev if needed.
                .sameSite("None") // cross-site allowed (FE and BE on different domains)
                .path("/auth/refresh")
                .maxAge(Duration.ofSeconds(jwtService.getRefreshExpSeconds()))
                .build();
        response.addHeader("Set-Cookie", cookie.toString());

        long expiresIn = jwtService.getAccessExpSeconds();

        return ResponseEntity.ok(new AuthResponse(accessToken, expiresIn));
    }

    // ====== REFRESH ======
    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(HttpServletRequest request, HttpServletResponse response) {
        // read refresh_token cookie
        String refreshToken = null;
        if (request.getCookies() != null) {
            for (Cookie c : request.getCookies()) {
                if ("refresh_token".equals(c.getName())) {
                    refreshToken = c.getValue();
                    break;
                }
            }
        }
        if (refreshToken == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("No refresh token");
        }

        try {
            DecodedJWT decoded = jwtService.verify(refreshToken);

            // ensure token type is refresh (we sign refresh with claim "type":"refresh")
            String type = decoded.getClaim("type").asString();
            if (type == null || !"refresh".equals(type)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid token type");
            }

            UUID userId = UUID.fromString(decoded.getSubject());
            User user = userService.findById(userId).orElse(null);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not found");
            }

            // Generate new access (optionally rotate refresh)
            String newAccess = jwtService.generateAccessToken(user);
            String newRefresh = jwtService.generateRefreshToken(user);

            // Replace cookie with new refresh (rotate to extend expiry)
            ResponseCookie cookie = ResponseCookie.from("refresh_token", newRefresh)
                    .httpOnly(true)
                    .secure(true)
                    .sameSite("None")
                    .path("/auth/refresh")
                    .maxAge(Duration.ofSeconds(jwtService.getRefreshExpSeconds()))
                    .build();
            response.addHeader("Set-Cookie", cookie.toString());

            return ResponseEntity.ok(new AuthResponse(newAccess, jwtService.getAccessExpSeconds()));

        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid/expired refresh token");
        }
    }

    // ====== LOGOUT (xoá cookie) ======
    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from("refresh_token", "")
                .httpOnly(true)
                .secure(true)
                .sameSite("None")
                .path("/auth/refresh")
                .maxAge(0)
                .build();
        response.addHeader("Set-Cookie", cookie.toString());
        return ResponseEntity.ok().body("Logged out");
    }

    @GetMapping("/me")
    public ResponseEntity<UserProfileDTO> getCurrentUser(@AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
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
}