package secure_shop.backend.dto.order;

import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import secure_shop.backend.enums.PaymentMethod;
import secure_shop.backend.enums.PaymentProvider;
import secure_shop.backend.enums.PaymentStatus;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;

/**
 * DTO for {@link secure_shop.backend.entities.Payment}
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PaymentDTO implements Serializable {
    UUID id;
    Instant createdAt;
    Instant updatedAt;
    @NotNull(message = "Phương thức thanh toán không được để trống")
    PaymentMethod method;
    @NotNull(message = "Nhà cung cấp thanh toán không được để trống")
    PaymentProvider provider;
    @NotNull(message = "Trạng thái thanh toán không được để trống")
    PaymentStatus status;
    @NotNull(message = "Số tiền thanh toán không được để trống")
    @Digits(message = "Số tiền không hợp lệ (tối đa 13 chữ số và 2 số thập phân)", integer = 13, fraction = 2)
    BigDecimal amount;
    String transactionId;
    Instant paidAt;
    Map<String, Object> gatewayResponse;
    UUID orderId;
}