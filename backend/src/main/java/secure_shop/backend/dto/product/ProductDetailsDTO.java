package secure_shop.backend.dto.product;

import lombok.*;

import java.io.Serializable;
import java.math.BigDecimal;
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
    private Boolean active;

    private BrandDTO brand;
    private CategoryDTO category;

    private String shortDesc;
    private String longDesc;

    private List<MediaAssetDTO> mediaAssets;
    private InventoryDTO inventory;
    private Set<ReviewDTO> reviews;
}
