package secure_shop.backend.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import secure_shop.backend.enums.DiscountType;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(
        name = "discounts",
        indexes = {
                @Index(name = "idx_discounts_code", columnList = "code"),
                @Index(name = "idx_discounts_active", columnList = "active"),
                @Index(name = "idx_discounts_dates", columnList = "start_at, end_at")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Discount extends BaseEntity {

    @NotBlank(message = "Mã giảm giá không được để trống")
    @Size(max = 50, message = "Mã giảm giá tối đa 50 ký tự")
    @Pattern(
            regexp = "^[A-Z0-9_-]+$",
            message = "Mã giảm giá chỉ được chứa chữ in hoa, số và ký tự '-' hoặc '_'"
    )
    @Column(nullable = false, unique = true, length = 50)
    private String code;

    @NotNull(message = "Loại giảm giá không được để trống")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private DiscountType discountType;

    @NotNull(message = "Giá trị giảm không được để trống")
    @DecimalMin(value = "0.01", inclusive = true, message = "Giá trị giảm phải lớn hơn 0")
    @Digits(integer = 13, fraction = 2, message = "Giá trị giảm không hợp lệ (tối đa 13 chữ số và 2 số thập phân)")
    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal discountValue;

    @DecimalMin(value = "0.0", inclusive = true, message = "Giá trị đơn hàng tối thiểu không được âm")
    @Digits(integer = 13, fraction = 2, message = "Giá trị đơn hàng tối thiểu không hợp lệ")
    @Column(precision = 15, scale = 2)
    private BigDecimal minOrderValue;

    @DecimalMin(value = "0.0", inclusive = true, message = "Giới hạn số lần sử dụng không được âm")
    @Digits(integer = 13, fraction = 2, message = "Giới hạn số lần sử dụng không hợp lệ")
    @Column(precision = 15, scale = 2)
    private Integer maxUsage;

    @Min(value = 1, message = "Giới hạn mỗi người dùng ít nhất là 1 lần")
    private Integer perUserLimit;

    @Builder.Default
    private Integer used = 0;

    @NotNull(message = "Thời gian bắt đầu không được để trống")
    @Column(nullable = false)
    private Instant startAt;

    @NotNull(message = "Thời gian kết thúc không được để trống")
    @Column(nullable = false)
    private Instant endAt;

    @NotNull(message = "Trạng thái hoạt động không được để trống")
    @Builder.Default
    @Column(nullable = false)
    private Boolean active = true;

    @OneToMany(mappedBy = "discount")
    @Builder.Default
    private Set<Order> orders = new HashSet<>();

    public boolean isValid() {
        Instant now = Instant.now();
        return active &&
                now.isAfter(startAt) &&
                now.isBefore(endAt) &&
                (maxUsage == null || used < maxUsage.intValue());
    }
}
