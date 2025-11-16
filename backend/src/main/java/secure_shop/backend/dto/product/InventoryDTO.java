package secure_shop.backend.dto.product;

import lombok.*;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryDTO {
    private Integer onHand;
    private Integer reserved;
    private boolean inStock;
    private UUID productId;
}

