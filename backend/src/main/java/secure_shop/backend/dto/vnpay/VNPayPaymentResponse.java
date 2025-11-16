package secure_shop.backend.dto.vnpay;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VNPayPaymentResponse implements Serializable {
    private String code;
    private String message;
    private String paymentUrl;
}
