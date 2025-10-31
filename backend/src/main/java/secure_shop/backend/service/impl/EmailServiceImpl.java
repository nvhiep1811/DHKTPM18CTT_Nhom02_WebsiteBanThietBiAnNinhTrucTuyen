package secure_shop.backend.service.impl;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;
import secure_shop.backend.service.EmailService;

import java.io.IOException;

@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    public void sendResetPasswordEmail(String to, String resetLink) throws MessagingException, IOException {
        // Chuẩn bị dữ liệu cho template
        Context context = new Context();
        context.setVariable("email", to);
        context.setVariable("resetLink", resetLink);

        // Tạo HTML từ Thymeleaf
        String htmlContent = templateEngine.process("reset-password", context);

        // Tạo message
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setFrom("support@myshop.com");
        helper.setTo(to);
        helper.setSubject("🔐 Đặt lại mật khẩu - SecureShop");
        helper.setText(htmlContent, true);

        // Gửi
        mailSender.send(message);
    }
}
