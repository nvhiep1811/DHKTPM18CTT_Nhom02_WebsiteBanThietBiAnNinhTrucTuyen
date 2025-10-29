package secure_shop.backend.entities;

import jakarta.persistence.*;
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

    @Column(nullable = false, unique = true, length = 50)
    private String code;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private DiscountType discountType;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal discountValue;

    @Column(precision = 15, scale = 2)
    private BigDecimal minOrderValue;

    @Column(precision = 15, scale = 2)
    private BigDecimal maxUsage;

    private Integer perUserLimit;

    @Builder.Default
    private Integer used = 0;

    @Column(nullable = false)
    private Instant startAt;

    @Column(nullable = false)
    private Instant endAt;

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
