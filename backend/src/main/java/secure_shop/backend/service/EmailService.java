package secure_shop.backend.service;

import jakarta.mail.MessagingException;
import secure_shop.backend.entities.Order;

import java.io.IOException;

public interface EmailService {
    
    void sendResetPasswordEmail(String to, String resetLink) throws MessagingException, IOException;
    
    void sendVerificationEmail(String to, String verificationLink) throws MessagingException, IOException;
    
    /**
     * Gửi email xác nhận đơn hàng (CÓ LINK XÁC NHẬN)
     * @param order Đơn hàng vừa tạo
     * @param confirmationLink Link để user xác nhận đơn hàng
     * @throws MessagingException
     * @throws IOException
     */
    void sendOrderConfirmationEmail(Order order, String confirmationLink) throws MessagingException, IOException;
}