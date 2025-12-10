package secure_shop.backend.dto.order;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import secure_shop.backend.dto.user.UserSummaryDTO;
import secure_shop.backend.dto.discount.DiscountDTO;
import secure_shop.backend.enums.OrderStatus;
import secure_shop.backend.enums.PaymentStatus;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Summary DTO for Order - excludes orderItems for performance optimization
 * Use this for listing orders. For full details including items, use OrderDetailsDTO
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OrderSummaryDTO implements Serializable {
    private UUID id;
    private OrderStatus status;
    private PaymentStatus paymentStatus;

    private BigDecimal subTotal;
    private BigDecimal discountTotal;
    private BigDecimal shippingFee;
    private BigDecimal grandTotal;

    private Boolean hasPaid;
    private Instant createdAt;
    private Instant updatedAt;
    private Instant confirmedAt;
    private Instant cancelledAt;

    private Map<String, String> shippingAddress = new HashMap<>();

    private DiscountDTO discount;
    private UserSummaryDTO user;
    
    // Note: orderItems intentionally excluded for performance
}
