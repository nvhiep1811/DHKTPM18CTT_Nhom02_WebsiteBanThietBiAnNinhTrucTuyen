package secure_shop.backend.service;

import jakarta.servlet.http.HttpServletRequest;
import secure_shop.backend.dto.vnpay.VNPayCallbackRequest;
import secure_shop.backend.dto.vnpay.VNPayIPNResponse;
import secure_shop.backend.dto.vnpay.VNPayPaymentRequest;
import secure_shop.backend.dto.vnpay.VNPayPaymentResponse;

import java.util.Map;
import java.util.UUID;

public interface VNPayService {

    VNPayPaymentResponse createPaymentUrl(VNPayPaymentRequest request, HttpServletRequest httpRequest, UUID currentUserId);

    VNPayCallbackRequest processCallback(Map<String, String> params);

    VNPayIPNResponse processIPN(Map<String, String> params);

    boolean validateSignature(Map<String, String> params, String secureHash);

    Map<String, String> queryTransaction(UUID orderId, String transactionDate);
}
