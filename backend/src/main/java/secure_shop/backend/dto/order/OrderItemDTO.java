package secure_shop.backend.dto.order;

import lombok.*;
import secure_shop.backend.dto.product.ProductSummaryDTO;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.UUID;

/**
 * DTO for {@link secure_shop.backend.entities.OrderItem}
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OrderItemDTO implements Serializable {
    private Long id;
    private BigDecimal unitPrice;
    private Integer quantity;
    private BigDecimal lineTotal;
    private ProductSummaryDTO product;
    private UUID orderId;
    private Boolean hasReview;
    private Long reviewId;
}