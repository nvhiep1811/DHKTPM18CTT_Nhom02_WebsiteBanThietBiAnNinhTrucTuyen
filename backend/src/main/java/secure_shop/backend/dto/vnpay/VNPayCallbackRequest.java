package secure_shop.backend.dto.vnpay;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;
import java.util.Map;
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VNPayCallbackRequest implements Serializable {
    private String vnp_TmnCode;
    private String vnp_Amount;
    private String vnp_BankCode;
    private String vnp_BankTranNo;
    private String vnp_CardType;
    private String vnp_PayDate;
    private String vnp_OrderInfo;
    private String vnp_TransactionNo;
    private String vnp_ResponseCode;
    private String vnp_TransactionStatus;
    private String vnp_TxnRef;
    private String vnp_SecureHashType;
    private String vnp_SecureHash;
    private Map<String, String> allParams;
    public boolean isSuccess() {
        return "00".equals(vnp_ResponseCode) && "00".equals(vnp_TransactionStatus);
    }
    public Long getAmountInVND() {
        if (vnp_Amount == null) return 0L;
        try {
            return Long.parseLong(vnp_Amount) / 100;
        } catch (NumberFormatException e) {
            return 0L;
        }
    }
}
