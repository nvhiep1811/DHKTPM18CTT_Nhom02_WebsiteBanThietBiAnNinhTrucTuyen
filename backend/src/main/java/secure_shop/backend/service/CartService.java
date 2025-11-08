package secure_shop.backend.service;

import secure_shop.backend.entities.cart.CartItem;
import secure_shop.backend.entities.cart.CartSession;

import java.util.List;
import java.util.UUID;

public interface CartService {

    /**
     * Lấy cart của user hiện tại từ Redis
     */
    CartSession getCart();

    /**
     * Lấy danh sách items trong cart
     */
    List<CartItem> getCartItems();

    /**
     * Thêm item vào cart
     */
    void addItem(CartItem item);

    /**
     * Cập nhật số lượng của một item
     */
    void updateQuantity(UUID productId, int quantity);

    /**
     * Xóa item khỏi cart
     */
    void removeItem(UUID productId);

    /**
     * Xóa toàn bộ cart
     */
    void clearCart();

    /**
     * Merge guest cart vào cart của user sau khi đăng nhập
     */
    void mergeGuestCart(List<CartItem> guestItems);
}