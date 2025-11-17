package secure_shop.backend.dto.discount;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import secure_shop.backend.enums.DiscountType;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class DiscountDetailsDTO {
    private UUID id;
    private String code;
    private DiscountType discountType;
    private BigDecimal discountValue;
    private BigDecimal minOrderValue;
    private Integer maxUsage;
    private Integer perUserLimit;
    private Integer used;
    private Instant startAt;
    private Instant endAt;
    private Boolean active;
    private Instant createdAt;
    private Instant updatedAt;

    // chỉ trả gọn thông tin order, tránh vòng lặp
//    private List<OrderSummaryDto> orders;
}
