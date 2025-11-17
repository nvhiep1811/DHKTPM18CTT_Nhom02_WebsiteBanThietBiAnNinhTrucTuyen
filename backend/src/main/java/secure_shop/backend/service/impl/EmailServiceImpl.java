package secure_shop.backend.service.impl;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;
import secure_shop.backend.entities.Order;
import secure_shop.backend.entities.OrderItem;
import secure_shop.backend.enums.PaymentStatus;
import secure_shop.backend.service.EmailService;
 

import java.io.IOException;
import java.math.BigDecimal;
import java.text.NumberFormat;
import java.time.format.DateTimeFormatter;
import java.time.ZoneId;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;
    @Value("${app.frontend.base-url:https://secure-shop.example}")
    private String frontendBaseUrl;

    @Override
    public void sendResetPasswordEmail(String to, String resetLink) throws MessagingException, IOException {
        Context context = new Context();
        context.setVariable("email", to);
        context.setVariable("resetLink", resetLink);

        String htmlContent = templateEngine.process("reset-password", context);

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setFrom("support@myshop.com");
        helper.setTo(to);
        helper.setSubject("🔐 Đặt lại mật khẩu - SecureShop");
        helper.setText(htmlContent, true);

        mailSender.send(message);
    }

    @Override
    public void sendVerificationEmail(String to, String verificationLink) throws MessagingException, IOException {
        Context context = new Context();
        context.setVariable("email", to);
        context.setVariable("verificationLink", verificationLink);

        String htmlContent = templateEngine.process("email-verification", context);

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setFrom("support@myshop.com");
        helper.setTo(to);
        helper.setSubject("✉️ Xác thực tài khoản - SecureShop");
        helper.setText(htmlContent, true);

        mailSender.send(message);
    }

    @Override
    public void sendOrderConfirmationEmail(Order order) throws MessagingException, IOException {
        if (order == null || order.getUser() == null || order.getUser().getEmail() == null) {
            log.warn("Skip sending order email: missing user/email. orderId={}", order != null ? order.getId() : null);
            return;
        }

        Context context = new Context(new Locale("vi", "VN"));
        context.setVariable("orderId", order.getId());
        context.setVariable("customerName", order.getUser().getName());
        String createdAtStr = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss")
            .withLocale(new Locale("vi", "VN"))
            .withZone(ZoneId.systemDefault())
            .format(order.getCreatedAt());
        context.setVariable("createdAt", createdAtStr);

        NumberFormat currencyFormat = NumberFormat.getCurrencyInstance(new Locale("vi", "VN"));
        context.setVariable("subTotal", formatCurrency(order.getSubTotal(), currencyFormat));
        context.setVariable("discountTotal", formatCurrency(order.getDiscountTotal(), currencyFormat));
        context.setVariable("shippingFee", formatCurrency(order.getShippingFee(), currencyFormat));
        context.setVariable("grandTotal", formatCurrency(order.getGrandTotal(), currencyFormat));
        context.setVariable("paymentStatus", order.getPaymentStatus());
        context.setVariable("hasPaid", order.getHasPaid() ? "ĐÃ THANH TOÁN" : "CHƯA THANH TOÁN");
        context.setVariable("isPaidLabel", order.getPaymentStatus() == PaymentStatus.PAID ? "PAID" : "UNPAID");
        context.setVariable("orderStatus", order.getStatus());
        if (order.getPayment() != null && order.getPayment().getMethod() != null) {
            context.setVariable("paymentMethod", order.getPayment().getMethod());
        } else {
            context.setVariable("paymentMethod", "N/A");
        }
        String orderLink = frontendBaseUrl.replaceAll("/$", "") + "/orders/" + order.getId();
        context.setVariable("orderLink", orderLink);

        // Shipping address map -> join for display
        if (order.getShippingAddress() != null && !order.getShippingAddress().isEmpty()) {
            StringBuilder addressBuilder = new StringBuilder();
            order.getShippingAddress().forEach((k, v) -> {
                if (v != null && !v.isBlank()) {
                    addressBuilder.append(v).append(", ");
                }
            });
            String address = addressBuilder.length() > 2 ? addressBuilder.substring(0, addressBuilder.length() - 2) : "";
            context.setVariable("shippingAddress", address);
        } else {
            context.setVariable("shippingAddress", "(Không có địa chỉ)");
        }

        // Order items
        context.setVariable("items", order.getOrderItems().stream().map(this::mapItem).toList());

        try {
            String htmlContent = templateEngine.process("order-confirmation", context);

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom("support@myshop.com");
            helper.setTo(order.getUser().getEmail());
            helper.setSubject("🛒 Xác nhận đơn hàng #" + order.getId() + " - SecureShop");
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Order email sent to {} for orderId={}", order.getUser().getEmail(), order.getId());
        } catch (Exception ex) {
            log.error("Failed to send order email for orderId={}", order.getId(), ex);
            if (ex instanceof MessagingException me) throw me;
            if (ex instanceof IOException ioe) throw ioe;
        }
    }

    

    private String formatCurrency(BigDecimal value, NumberFormat nf) {
        if (value == null) return nf.format(0);
        return nf.format(value);
    }

    private ItemView mapItem(OrderItem item) {
        return new ItemView(
                item.getProduct() != null ? item.getProduct().getName() : "(Sản phẩm)",
                item.getQuantity() != null ? item.getQuantity() : 0,
                item.getUnitPrice(),
                item.getLineTotal(),
                item.getProduct() != null ? item.getProduct().getSku() : null
        );
    }

    private record ItemView(String name, Integer quantity, BigDecimal unitPrice, BigDecimal lineTotal, String sku) {}
}