package secure_shop.backend.dto.product;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Set;
import java.util.UUID;

// ProductDetailsDTO dùng để truyền chi tiết sản phẩm để tránh việc truyền quá nhiều dữ liệu không cần thiết
// khi chỉ cần thông tin cơ bản của sản phẩm (ProductDto), ví dụ như khi truyền vào giỏ hàng hay danh sách sản phẩm.

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductDetailsDTO implements Serializable {
    private UUID id;
    private String sku;
    private String name;
    private BigDecimal listedPrice;
    private BigDecimal price;
    private Boolean active;

    private BrandDTO brand;
    private CategorySummaryDTO category;

    private String shortDesc;
    private String longDesc;

    private String thumbnailUrl;


    private Double rating;
    private Integer reviewCount;

    private List<MediaAssetDTO> mediaAssets;
    private Integer availableStock;
    private Boolean inStock;

    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    private Set<ReviewDTO> reviews;

    // Timestamps for tracking
    private Instant createdAt;
    private Instant updatedAt;
    private Instant deletedAt;
}
