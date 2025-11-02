package secure_shop.backend.dto;

import lombok.*;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryDTO {
    private Long id;
    private Integer onHand;
    private Integer reserved;
    private UUID productId;
    private String productName;
}

