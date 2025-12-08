package secure_shop.backend.dto.auth;

import lombok.Data;
import secure_shop.backend.entities.cart.CartItem;

import java.util.List;

@Data
public class LoginRequest {
    private String email;
    private String password;
    private List<CartItem> guestCartItems; // Giỏ hàng của guest trước khi đăng nhập
}
