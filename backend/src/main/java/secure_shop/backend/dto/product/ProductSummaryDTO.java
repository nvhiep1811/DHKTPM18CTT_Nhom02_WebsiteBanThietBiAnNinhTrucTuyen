package secure_shop.backend.dto.product;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ProductSummaryDTO implements Serializable {
    private UUID id;
    private String sku;
    private String name;
    private BigDecimal listedPrice;
    private String thumbnailUrl;
}
