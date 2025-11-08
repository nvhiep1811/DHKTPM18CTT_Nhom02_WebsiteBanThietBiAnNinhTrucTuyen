package secure_shop.backend.entities.cart;

import lombok.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartItem implements Serializable {
    private UUID productId;
    private String name;
    private BigDecimal price;
    private String thumbnailUrl;
    private boolean inStock;
    private Integer availableStock;
    private int quantity;
}
