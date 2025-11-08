package secure_shop.backend.dto.product;

import lombok.*;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * DTO for {@link secure_shop.backend.entities.Product}
 */

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductDTO implements Serializable {
    private UUID id;
    private String sku;
    private String name;
    private BigDecimal listedPrice;
    private BigDecimal price;
    private Boolean active;
    private String shortDesc;

    private BrandDTO brand;
    private CategorySummaryDTO category;

    private InventoryDTO inventory;

    private Double rating;
    private Integer reviewCount;

    // Ảnh đại diện (lấy từ mediaAssets[0] nếu có)
    private String thumbnailUrl;

    // Sài cho admin dashboard
    private Instant createdAt;
    private Instant updatedAt;
    private Instant deletedAt;
}