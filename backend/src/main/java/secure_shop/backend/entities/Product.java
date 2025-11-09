package secure_shop.backend.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;

@Entity
@Table(
        name = "products",
        indexes = {
                @Index(name = "idx_products_sku", columnList = "sku"),
                @Index(name = "idx_products_active", columnList = "active"),
                @Index(name = "idx_products_category", columnList = "category_id"),
                @Index(name = "idx_products_brand", columnList = "brand_id"),
                @Index(name = "idx_products_name", columnList = "name"),
                @Index(name = "idx_products_listed_price", columnList = "listed_price"),
                @Index(name = "idx_products_price", columnList = "price")
        }
)
@SQLDelete(sql = "UPDATE products SET deleted_at = now(), active = false WHERE id = ?")
@SQLRestriction("deleted_at IS NULL")
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

    @NotNull(message = "Giá bán không được để trống")
    @DecimalMin(value = "0.0", inclusive = false, message = "Giá bán phải lớn hơn 0")
    @Digits(integer = 10, fraction = 2, message = "Giá bán không hợp lệ (tối đa 10 chữ số, 2 số thập phân)")
    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal price;

    @NotNull(message = "Trạng thái hoạt động không được để trống")
    @Builder.Default
    @Column(nullable = false)
    private Boolean active = true;

    @Size(max = 2048, message = "URL ảnh đại diện quá dài")
    private String thumbnailUrl;

    // Soft delete
    @Column(name = "deleted_at")
    private Instant deletedAt;

    @NotNull(message = "Điểm đánh giá không được để trống")
    @DecimalMin(value = "0.0", inclusive = true, message = "Điểm đánh giá không được nhỏ hơn 0")
    @DecimalMax(value = "5.0", inclusive = true, message = "Điểm đánh giá không được lớn hơn 5")
    @Builder.Default
    @Column(nullable = false)
    private Double rating = 0.0;

    @NotNull(message = "Số lượng đánh giá không được để trống")
    @Min(value = 0, message = "Số lượng đánh giá không được âm")
    @Builder.Default
    @Column(nullable = false)
    private Integer reviewCount = 0;

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
    private List<MediaAsset> mediaAssets = new ArrayList<>();

    @OneToOne(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    private Inventory inventory;

    @OneToMany(mappedBy = "product")
    @Builder.Default
    private Set<OrderItem> orderItems = new HashSet<>();

    // ===== Helper methods =====
    public void softDelete() {
        this.deletedAt = Instant.now();
        this.active = false;
    }

    public void restore() {
        this.deletedAt = null;
        this.active = true;
    }

    public boolean isDeleted() {
        return this.deletedAt != null;
    }

    // ===== Logic cập nhật rating =====
    public void updateRating(double newRating) {
        if (newRating < 0.0 || newRating > 5.0) {
            throw new IllegalArgumentException("Rating must be between 0 and 5");
        }

        int currentCount = (reviewCount == null) ? 0 : reviewCount;
        double currentRating = (rating == null) ? 0.0 : rating;

        double total = currentRating * currentCount;
        currentCount++;
        rating = (total + newRating) / currentCount;
        reviewCount = currentCount;
    }

    public void removeReview(double removedRating) {
        if (removedRating < 0.0 || removedRating > 5.0) {
            throw new IllegalArgumentException("Rating must be between 0 and 5");
        }

        if (reviewCount == null || reviewCount <= 1) {
            rating = 0.0;
            reviewCount = 0;
            return;
        }

        double total = rating * reviewCount;
        reviewCount--;
        rating = (total - removedRating) / reviewCount;
    }
}