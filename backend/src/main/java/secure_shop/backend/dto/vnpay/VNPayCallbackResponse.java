package secure_shop.backend.dto.vnpay;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import secure_shop.backend.dto.order.OrderDTO;
import secure_shop.backend.dto.order.PaymentDTO;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VNPayCallbackResponse implements Serializable {
    private Boolean success;
    private String message;
    private String responseCode;
    private String transactionId;
    private String txnRef;
    private OrderDTO order;
    private PaymentDTO payment;
}

