package secure_shop.backend.dto.order.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import secure_shop.backend.enums.OrderStatus;
import secure_shop.backend.enums.PaymentStatus;

import java.io.Serializable;
import java.time.Instant;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OrderUpdateRequest implements Serializable {
    @NotNull
    private OrderStatus status;

    private PaymentStatus paymentStatus;

    private Boolean hasPaid;

    private Instant confirmedAt;
    private Instant cancelledAt;
}
