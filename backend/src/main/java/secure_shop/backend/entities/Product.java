package secure_shop.backend.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

@Entity
@Table(
        name = "products",
        indexes = {
                @Index(name = "idx_products_sku", columnList = "sku"),
                @Index(name = "idx_products_active", columnList = "active"),
                @Index(name = "idx_products_category", columnList = "category_id"),
                @Index(name = "idx_products_brand", columnList = "brand_id"),
                @Index(name = "idx_products_name", columnList = "name"),
                // Partial index for active products (tạo trong migration)
                // CREATE INDEX idx_products_active_only ON products(id) WHERE active = true;
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product extends BaseEntity {

    @NotBlank(message = "Mã SKU không được để trống")
    @Size(max = 100, message = "Mã SKU tối đa 100 ký tự")
    @Pattern(
            regexp = "^[A-Za-z0-9\\-_.]+$",
            message = "Mã SKU chỉ được chứa chữ, số và các ký tự '-', '_', '.'"
    )
    @Column(nullable = false, unique = true, length = 50)
    private String sku;

    @NotBlank(message = "Tên sản phẩm không được để trống")
    @Size(max = 255, message = "Tên sản phẩm tối đa 255 ký tự")
    @Pattern(
            regexp = "^[\\p{L}0-9 .,'&\\-()]+$",
            message = "Tên sản phẩm chỉ được chứa chữ cái, số và các ký tự hợp lệ như . , ' & - ( )"
    )
    @Column(nullable = false, length = 500)
    private String name;

    @Size(max = 500, message = "Mô tả ngắn tối đa 500 ký tự")
    @Column(columnDefinition = "TEXT")
    private String shortDesc;

    @Size(max = 5000, message = "Mô tả chi tiết tối đa 5000 ký tự")
    @Column(columnDefinition = "TEXT")
    private String longDesc;

    @NotNull(message = "Giá niêm yết không được để trống")
    @DecimalMin(value = "0.0", inclusive = false, message = "Giá niêm yết phải lớn hơn 0")
    @Digits(integer = 10, fraction = 2, message = "Giá niêm yết không hợp lệ (tối đa 10 chữ số, 2 số thập phân)")
    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal listedPrice;

    @NotNull(message = "Trạng thái hoạt động không được để trống")
    @Builder.Default
    @Column(nullable = false)
    private Boolean active = true;

    // Soft delete
    private Instant deletedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "brand_id")
    private Brand brand;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private Set<Review> reviews = new HashSet<>();

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private Set<MediaAsset> mediaAssets = new HashSet<>();

    @OneToOne(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    private Inventory inventory;

    @OneToMany(mappedBy = "product")
    @Builder.Default
    private Set<OrderItem> orderItems = new HashSet<>();
}