package secure_shop.backend.service;

import secure_shop.backend.dto.vnpay.VNPayCallbackResponse;
import secure_shop.backend.dto.vnpay.VNPayIPNResponse;

import java.util.Map;
import java.util.UUID;

public interface VNPayService {

    String createPaymentUrl(UUID orderId, String ipAddress);

    VNPayCallbackResponse processCallbackWithDetails(Map<String, String> params);

//    VNPayIPNResponse processIPN(Map<String, String> params);
//
//    boolean validateSignature(Map<String, String> params, String secureHash);
//
//    Map<String, String> queryTransaction(UUID orderId, String transactionDate);
}
