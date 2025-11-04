package secure_shop.backend.dto.ticket;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import secure_shop.backend.dto.product.ProductSummaryDTO;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.Instant;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class WarrantyRequestDTO implements Serializable {
    private Long id;
    private String issueType;
    private String description;
    private String status;
    private Instant requestedAt;
    private Instant resolvedAt;

    private ProductSummaryDTO product;

    private Long orderItemId;
    private BigDecimal unitPrice;
    private Integer quantity;
}
