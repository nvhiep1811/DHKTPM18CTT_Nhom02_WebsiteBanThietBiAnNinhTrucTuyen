package secure_shop.backend.service.impl;

import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import secure_shop.backend.service.EmailService;
import secure_shop.backend.service.PasswordResetService;
import secure_shop.backend.service.UserService;
import secure_shop.backend.utils.HashUtil;

import java.io.IOException;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class PasswordResetServiceImpl implements PasswordResetService {

    private final EmailService emailService;
    private final RedisTemplate<String, String> redisTemplate;
    private final UserService userService;

    @Value("${frontend.url}")
    private String frontendUrl;

    // Gửi link khôi phục (hoặc resend nếu đã tồn tại)
    public void sendResetLink(String email) {
        String countKey = "reset_count:" + email;
        String countStr = redisTemplate.opsForValue().get(countKey);
        int count = countStr == null ? 0 : Integer.parseInt(countStr);

        if (count >= 3) {
            throw new RuntimeException("Bạn đã vượt quá giới hạn gửi yêu cầu (3 lần/giờ).");
        }

        if (userService.findByEmail(email).isEmpty()) {
            throw new RuntimeException("Email không tồn tại trong hệ thống.");
        }

        redisTemplate.opsForValue().set(countKey, String.valueOf(count + 1), 1, TimeUnit.HOURS);

        // Nếu đã có token còn hạn thì không tạo mới (resend)
        String existingToken = redisTemplate.opsForValue().get("reset_email:" + email);
        String rawToken;
        if (existingToken != null) {
            rawToken = existingToken;
        } else {
            rawToken = UUID.randomUUID().toString();
            String hashed = HashUtil.sha256(rawToken);
            redisTemplate.opsForValue().set("reset_token:" + hashed, email, 10, TimeUnit.MINUTES);
            redisTemplate.opsForValue().set("reset_email:" + email, rawToken, 10, TimeUnit.MINUTES);
        }

        String resetLink = frontendUrl + "/reset-password?token=" + rawToken;
        sendResetMailAsync(email, resetLink);
    }

    @Async
    public void sendResetMailAsync(String email, String link) {
        try {
            emailService.sendResetPasswordEmail(email, link);
        } catch (MessagingException | IOException e) {
            throw new RuntimeException("Lỗi gửi mail: " + e.getMessage());
        }
    }

    public boolean verifyToken(String rawToken) {
        String hashed = HashUtil.sha256(rawToken);
        return redisTemplate.hasKey("reset_token:" + hashed);
    }

    public boolean resetPassword(String rawToken, String newPassword) {
        String hashed = HashUtil.sha256(rawToken);
        String email = redisTemplate.opsForValue().get("reset_token:" + hashed);

        if (email == null) return false;

        boolean updated = userService.updatePassword(email, newPassword);
        if (updated) {
            redisTemplate.delete("reset_token:" + hashed);
            redisTemplate.delete("reset_email:" + email);
        }

        return updated;
    }
}