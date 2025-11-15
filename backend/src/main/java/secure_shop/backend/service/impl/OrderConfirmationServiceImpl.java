package secure_shop.backend.service.impl;

import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import secure_shop.backend.entities.Order;
import secure_shop.backend.enums.OrderStatus;
import secure_shop.backend.exception.ResourceNotFoundException;
import secure_shop.backend.repositories.OrderRepository;
import secure_shop.backend.service.EmailService;
import secure_shop.backend.service.OrderConfirmationService;
import secure_shop.backend.utils.HashUtil;

import java.io.IOException;
import java.time.Instant;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class OrderConfirmationServiceImpl implements OrderConfirmationService {

    private final EmailService emailService;
    private final RedisTemplate<String, String> redisTemplate;
    private final OrderRepository orderRepository;

    @Value("${frontend.url}")
    private String frontendUrl;

    @Override
    @Async
    public void sendOrderConfirmationEmail(UUID orderId) {
        try {
            System.out.println("📧 [ORDER-CONFIRM] Starting to send confirmation email for order: " + orderId);

            // Fetch order với đầy đủ thông tin
            Order order = orderRepository.findByIdWithDetails(orderId)
                    .orElseThrow(() -> new ResourceNotFoundException("Order", orderId));

            if (order.getUser() == null || order.getUser().getEmail() == null) {
                System.out.println("⚠️ [ORDER-CONFIRM] Order has no user email, skipping");
                return;
            }

            // Tạo token xác nhận
            String rawToken = UUID.randomUUID().toString();
            String hashedToken = HashUtil.sha256(rawToken);

            // Lưu token -> orderId vào Redis (24h)
            redisTemplate.opsForValue().set(
                "order_confirm_token:" + hashedToken,
                orderId.toString(),
                24,
                TimeUnit.HOURS
            );

            // Tạo link xác nhận
            String confirmationLink = frontendUrl + "/confirm-order?token=" + rawToken;

            // Gửi email với link xác nhận
            emailService.sendOrderConfirmationEmail(order, confirmationLink);

            System.out.println("✅ [ORDER-CONFIRM] Confirmation email sent successfully to: " + order.getUser().getEmail());

        } catch (Exception e) {
            System.err.println("❌ [ORDER-CONFIRM] Failed to send confirmation email: " + e.getMessage());
            e.printStackTrace();
        }
    }

    @Override
    @Transactional
    public boolean confirmOrder(String rawToken) {
        System.out.println("🔍 [ORDER-CONFIRM] Starting order confirmation for token: " + rawToken.substring(0, 8) + "...");

        // Hash token
        String hashedToken = HashUtil.sha256(rawToken);
        String orderIdStr = redisTemplate.opsForValue().get("order_confirm_token:" + hashedToken);

        if (orderIdStr == null) {
            System.out.println("❌ [ORDER-CONFIRM] Token not found or expired");
            return false;
        }

        UUID orderId;
        try {
            orderId = UUID.fromString(orderIdStr);
        } catch (IllegalArgumentException e) {
            System.out.println("❌ [ORDER-CONFIRM] Invalid order ID format: " + orderIdStr);
            return false;
        }

        // Fetch order
        Order order = orderRepository.findById(orderId).orElse(null);
        if (order == null) {
            System.out.println("❌ [ORDER-CONFIRM] Order not found with ID: " + orderId);
            return false;
        }

        // Kiểm tra nếu đã xác nhận rồi
        if (order.getStatus() != OrderStatus.PENDING) {
            System.out.println("⚠️ [ORDER-CONFIRM] Order already processed, current status: " + order.getStatus());
            
            // Xóa token
            redisTemplate.delete("order_confirm_token:" + hashedToken);
            
            // Vẫn return true vì đơn hàng đã được xử lý
            return true;
        }

        // Cập nhật trạng thái
        System.out.println("✅ [ORDER-CONFIRM] Confirming order: " + orderId);
        order.setStatus(OrderStatus.WAITING_FOR_DELIVERY);
        order.setConfirmedAt(Instant.now());
        orderRepository.save(order);

        // Xóa token đã sử dụng
        redisTemplate.delete("order_confirm_token:" + hashedToken);

        System.out.println("✅ [ORDER-CONFIRM] Order confirmed successfully");
        return true;
    }

    @Override
    public boolean isOrderConfirmed(UUID orderId) {
        Order order = orderRepository.findById(orderId).orElse(null);
        if (order == null) {
            return false;
        }
        // Đơn hàng được coi là đã xác nhận nếu không còn ở trạng thái PENDING
        return order.getStatus() != OrderStatus.PENDING;
    }
}