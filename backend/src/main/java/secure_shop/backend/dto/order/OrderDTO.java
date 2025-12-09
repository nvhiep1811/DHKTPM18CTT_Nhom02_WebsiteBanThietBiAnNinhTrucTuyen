package secure_shop.backend.dto.order;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import secure_shop.backend.dto.user.UserSummaryDTO;
import secure_shop.backend.dto.discount.DiscountDTO;
import secure_shop.backend.dto.order.OrderItemDTO;
import secure_shop.backend.enums.OrderStatus;
import secure_shop.backend.enums.PaymentStatus;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OrderDTO implements Serializable {
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
    private Set<OrderItemDTO> orderItems; // Add this line
}