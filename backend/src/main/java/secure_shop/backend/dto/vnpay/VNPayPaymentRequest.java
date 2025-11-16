package secure_shop.backend.dto.vnpay;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;
import java.util.UUID;
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VNPayPaymentRequest implements Serializable {
    @NotNull(message = "Order ID khong duoc de trong")
    private UUID orderId;
    @NotNull(message = "So tien khong duoc de trong")
    @Min(value = 1000, message = "So tien toi thieu la 1,000 VND")
    private Long amount;
    @Builder.Default
    private String orderInfo = "Thanh toan don hang";
    @Builder.Default
    private String orderType = "other";
    private String bankCode;
    @Builder.Default
    private String language = "vn";
}
