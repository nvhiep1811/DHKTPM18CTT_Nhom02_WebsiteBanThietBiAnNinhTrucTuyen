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
public class VNPayIPNResponse implements Serializable {
    private String RspCode;
    private String Message;
    public static VNPayIPNResponse success() {
        return VNPayIPNResponse.builder().RspCode("00").Message("Confirm Success").build();
    }
    public static VNPayIPNResponse orderNotFound() {
        return VNPayIPNResponse.builder().RspCode("01").Message("Order not Found").build();
    }
    public static VNPayIPNResponse orderAlreadyConfirmed() {
        return VNPayIPNResponse.builder().RspCode("02").Message("Order already confirmed").build();
    }
    public static VNPayIPNResponse invalidAmount() {
        return VNPayIPNResponse.builder().RspCode("04").Message("Invalid Amount").build();
    }
    public static VNPayIPNResponse invalidSignature() {
        return VNPayIPNResponse.builder().RspCode("97").Message("Invalid Checksum").build();
    }
    public static VNPayIPNResponse unknownError() {
        return VNPayIPNResponse.builder().RspCode("99").Message("Unknown error").build();
    }
}
