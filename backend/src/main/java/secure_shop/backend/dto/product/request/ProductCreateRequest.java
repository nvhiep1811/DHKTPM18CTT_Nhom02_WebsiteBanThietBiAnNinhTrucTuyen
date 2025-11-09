package secure_shop.backend.dto.product.request;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ProductCreateRequest {
    @NotBlank(message = "Mã SKU không được để trống")
    @Size(max = 100, message = "Mã SKU tối đa 100 ký tự")
    @Pattern(
            regexp = "^[A-Za-z0-9\\-_.]+$",
            message = "Mã SKU chỉ được chứa chữ, số và các ký tự '-', '_', '.'"
    )
    private String sku;

    @NotBlank
    private String name;

    @NotNull
    @Positive
    private BigDecimal listPrice;

    private String shortDescription;
    private String fullDescription;

    private UUID brandId;
    private UUID categoryId;

    private List<String> mediaAssetUris;

    @PositiveOrZero
    private Integer quantityInStock;
}
