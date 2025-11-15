package secure_shop.backend.service;

import java.util.UUID;

public interface OrderConfirmationService {
    
    /**
     * Gửi email xác nhận đơn hàng với token
     * @param orderId ID đơn hàng
     */
    void sendOrderConfirmationEmail(UUID orderId);
    
    /**
     * Xác nhận đơn hàng qua token từ email
     * @param token Token xác nhận
     * @return true nếu xác nhận thành công
     */
    boolean confirmOrder(String token);
    
    /**
     * Kiểm tra trạng thái xác nhận của đơn hàng
     * @param orderId ID đơn hàng
     * @return true nếu đã xác nhận
     */
    boolean isOrderConfirmed(UUID orderId);
}