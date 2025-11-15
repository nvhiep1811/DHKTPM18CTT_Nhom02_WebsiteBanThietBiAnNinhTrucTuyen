package secure_shop.backend.service.impl;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;
import secure_shop.backend.entities.Order;
import secure_shop.backend.entities.OrderItem;
import secure_shop.backend.service.EmailService;

import java.io.IOException;
import java.text.NumberFormat;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    private static final DateTimeFormatter DATE_FORMATTER = 
        DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss")
            .withZone(ZoneId.of("Asia/Ho_Chi_Minh"));
    
    private static final NumberFormat CURRENCY_FORMATTER = 
        NumberFormat.getCurrencyInstance(new Locale("vi", "VN"));

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
    public void sendOrderConfirmationEmail(Order order, String confirmationLink) throws MessagingException, IOException {
        String recipientEmail = order.getUser() != null ? order.getUser().getEmail() : null;
        
        if (recipientEmail == null || recipientEmail.isBlank()) {
            throw new IllegalArgumentException("Không thể gửi email: Email người nhận không tồn tại");
        }

        Context context = new Context();
        
        // Thông tin đơn hàng
        context.setVariable("orderId", order.getId().toString());
        context.setVariable("orderDate", DATE_FORMATTER.format(order.getCreatedAt()));
        context.setVariable("customerName", order.getUser().getName());
        context.setVariable("customerEmail", recipientEmail);
        
        // ✅ Link xác nhận đơn hàng
        context.setVariable("confirmationLink", confirmationLink);
        
        // Địa chỉ giao hàng
        Map<String, String> shippingAddress = order.getShippingAddress();
        context.setVariable("shippingAddress", formatAddress(shippingAddress));
        
        // Danh sách sản phẩm
        List<Map<String, String>> items = order.getOrderItems().stream()
            .map(this::mapOrderItemToEmailData)
            .collect(Collectors.toList());
        context.setVariable("orderItems", items);
        
        // Tổng tiền
        context.setVariable("subTotal", CURRENCY_FORMATTER.format(order.getSubTotal()));
        context.setVariable("discountTotal", CURRENCY_FORMATTER.format(order.getDiscountTotal()));
        context.setVariable("shippingFee", CURRENCY_FORMATTER.format(order.getShippingFee()));
        context.setVariable("grandTotal", CURRENCY_FORMATTER.format(order.getGrandTotal()));
        
        // Trạng thái
        context.setVariable("orderStatus", getStatusText(order.getStatus().name()));
        context.setVariable("paymentStatus", getPaymentStatusText(order.getPaymentStatus().name()));

        String htmlContent = templateEngine.process("order-confirmation", context);

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setFrom("support@myshop.com");
        helper.setTo(recipientEmail);
        helper.setSubject("📦 Xác nhận đơn hàng #" + order.getId().toString().substring(0, 8).toUpperCase() + " - SecureShop");
        helper.setText(htmlContent, true);

        mailSender.send(message);
    }

    private Map<String, String> mapOrderItemToEmailData(OrderItem item) {
        Map<String, String> data = new HashMap<>();
        data.put("productName", item.getProduct().getName());
        data.put("quantity", String.valueOf(item.getQuantity()));
        data.put("unitPrice", CURRENCY_FORMATTER.format(item.getUnitPrice()));
        data.put("lineTotal", CURRENCY_FORMATTER.format(item.getLineTotal()));
        
        String imageUrl = item.getProduct().getThumbnailUrl();
        data.put("imageUrl", imageUrl != null ? imageUrl : "");
        
        return data;
    }

    private String formatAddress(Map<String, String> addressMap) {
        if (addressMap == null || addressMap.isEmpty()) {
            return "Chưa cập nhật";
        }
        
        StringBuilder sb = new StringBuilder();
        
        if (addressMap.containsKey("street")) {
            sb.append(addressMap.get("street")).append(", ");
        }
        if (addressMap.containsKey("ward")) {
            sb.append(addressMap.get("ward")).append(", ");
        }
        if (addressMap.containsKey("district")) {
            sb.append(addressMap.get("district")).append(", ");
        }
        if (addressMap.containsKey("city")) {
            sb.append(addressMap.get("city"));
        }
        
        String result = sb.toString();
        return result.endsWith(", ") ? result.substring(0, result.length() - 2) : result;
    }

    private String getStatusText(String status) {
        return switch (status) {
            case "PENDING" -> "Chờ xác nhận";
            case "WAITING_FOR_DELIVERY" -> "Chờ lấy hàng";
            case "IN_TRANSIT" -> "Đang giao hàng";
            case "DELIVERED" -> "Đã giao hàng";
            case "CANCELLED" -> "Đã hủy";
            default -> status;
        };
    }

    private String getPaymentStatusText(String status) {
        return switch (status) {
            case "UNPAID" -> "Chưa thanh toán";
            case "PAID" -> "Đã thanh toán";
            case "REFUNDED" -> "Đã hoàn tiền";
            case "FAILED" -> "Thanh toán thất bại";
            default -> status;
        };
    }
}