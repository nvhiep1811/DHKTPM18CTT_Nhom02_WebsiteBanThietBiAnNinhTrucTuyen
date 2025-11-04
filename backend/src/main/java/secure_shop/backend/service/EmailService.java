package secure_shop.backend.service;

import jakarta.mail.MessagingException;
import java.io.IOException;

public interface EmailService {
    void sendResetPasswordEmail(String to, String resetLink) throws MessagingException, IOException;
    void sendVerificationEmail(String to, String verificationLink) throws MessagingException, IOException;
}