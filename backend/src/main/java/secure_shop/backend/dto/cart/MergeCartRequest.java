package secure_shop.backend.dto.cart;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import secure_shop.backend.entities.cart.CartItem;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MergeCartRequest {
    private List<CartItem> items;
}