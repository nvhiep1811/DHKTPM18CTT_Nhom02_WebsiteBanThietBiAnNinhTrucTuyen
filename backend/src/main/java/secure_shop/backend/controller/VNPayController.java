package secure_shop.backend.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import secure_shop.backend.config.security.CustomUserDetails;
import secure_shop.backend.dto.vnpay.VNPayCallbackRequest;
import secure_shop.backend.dto.vnpay.VNPayIPNResponse;
import secure_shop.backend.dto.vnpay.VNPayPaymentRequest;
import secure_shop.backend.dto.vnpay.VNPayPaymentResponse;
import secure_shop.backend.service.VNPayService;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/vnpay")
@RequiredArgsConstructor
@Slf4j
public class VNPayController {

    private final VNPayService vnPayService;

    /**
     * Create VNPay payment URL
     * POST /api/vnpay/create-payment
     */
    @PostMapping("/create-payment")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<VNPayPaymentResponse> createPayment(
            @Valid @RequestBody VNPayPaymentRequest request,
            HttpServletRequest httpRequest,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        UUID currentUserId = userDetails.getUser().getId();
        log.info("User {} creating VNPay payment for order: {}", currentUserId, request.getOrderId());

        VNPayPaymentResponse response = vnPayService.createPaymentUrl(request, httpRequest, currentUserId);

        if ("00".equals(response.getCode())) {
            return ResponseEntity.ok(response);
        } else if ("403".equals(response.getCode())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
        } else if ("409".equals(response.getCode())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    /**
     * Handle VNPay payment callback (return URL)
     * This endpoint receives the redirect from VNPay after user completes payment
     * GET /api/vnpay/payment-callback?vnp_Amount=...&vnp_BankCode=...
     */
    @GetMapping("/payment-callback")
    public ResponseEntity<VNPayCallbackRequest> paymentCallback(@RequestParam Map<String, String> params) {
        log.info("Received VNPay payment callback");

        try {
            VNPayCallbackRequest callback = vnPayService.processCallback(params);
            return ResponseEntity.ok(callback);
        } catch (Exception e) {
            log.error("Error processing payment callback", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * Handle VNPay IPN (Instant Payment Notification)
     * This endpoint receives server-to-server notification from VNPay
     * POST /api/vnpay/ipn
     */
    @PostMapping("/ipn")
    public ResponseEntity<VNPayIPNResponse> handleIPN(@RequestParam Map<String, String> params) {
        log.info("Received VNPay IPN notification");

        try {
            VNPayIPNResponse response = vnPayService.processIPN(params);

            // Always return 200 OK to VNPay, but with appropriate response code
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error processing IPN", e);
            return ResponseEntity.ok(VNPayIPNResponse.unknownError());
        }
    }

    /**
     * Alternative IPN endpoint with GET method
     * Some configurations might use GET for IPN
     */
    @GetMapping("/ipn")
    public ResponseEntity<VNPayIPNResponse> handleIPNGet(@RequestParam Map<String, String> params) {
        log.info("Received VNPay IPN notification (GET)");
        return handleIPN(params);
    }

    /**
     * Validate VNPay signature (utility endpoint for testing)
     * POST /api/vnpay/validate-signature
     */
    @PostMapping("/validate-signature")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Boolean>> validateSignature(@RequestBody Map<String, String> params) {
        log.info("Validating VNPay signature");

        String secureHash = params.get("vnp_SecureHash");
        params.remove("vnp_SecureHash");
        params.remove("vnp_SecureHashType");

        boolean isValid = vnPayService.validateSignature(params, secureHash);

        Map<String, Boolean> response = new HashMap<>();
        response.put("isValid", isValid);

        return ResponseEntity.ok(response);
    }
}
