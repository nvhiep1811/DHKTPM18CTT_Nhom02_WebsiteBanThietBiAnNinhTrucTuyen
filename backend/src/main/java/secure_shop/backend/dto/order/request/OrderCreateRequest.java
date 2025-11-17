package secure_shop.backend.dto.order.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import secure_shop.backend.enums.PaymentMethod;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OrderCreateRequest implements Serializable {
    @NotEmpty
    private List<OrderItemRequest> items;

    @NotNull
    private BigDecimal shippingFee;

    private String discountCode;

    @NotEmpty
    private Map<String, String> shippingAddress;

    private UUID userId;

    private PaymentMethod paymentMethod;
}
