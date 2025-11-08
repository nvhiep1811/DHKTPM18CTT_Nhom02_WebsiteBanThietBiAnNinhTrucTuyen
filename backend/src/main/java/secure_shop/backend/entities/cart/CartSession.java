package secure_shop.backend.entities.cart;

import lombok.*;
import java.io.Serializable;
import java.util.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartSession implements Serializable {
    private List<CartItem> items = new ArrayList<>();

    public void addItem(CartItem item) {
        Optional<CartItem> existing = items.stream()
                .filter(i -> i.getProductId().equals(item.getProductId()))
                .findFirst();

        if (existing.isPresent()) {
            CartItem found = existing.get();
            found.setQuantity(found.getQuantity() + item.getQuantity());
        } else {
            items.add(item);
        }
    }

    public void removeItem(UUID productId) {
        items.removeIf(i -> i.getProductId().equals(productId));
    }

    public void updateQuantity(UUID productId, int quantity) {
        items.stream()
                .filter(i -> i.getProductId().equals(productId))
                .findFirst()
                .ifPresent(i -> i.setQuantity(quantity));
    }

    public void clear() {
        items.clear();
    }
}