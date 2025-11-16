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
import secure_shop.backend.dto.vnpay.VNPayCallbackResponse;
import secure_shop.backend.dto.vnpay.VNPayPaymentRequest;
import secure_shop.backend.dto.vnpay.VNPayPaymentResponse;
import secure_shop.backend.service.VNPayService;

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

        try {
            UUID currentUserId = userDetails.getUser().getId();
            log.info("User {} creating VNPay payment for order: {}", currentUserId, request.getOrderId());

            // Get client IP
            String ipAddress = getClientIP(httpRequest);

            // Create payment URL
            String paymentUrl = vnPayService.createPaymentUrl(request.getOrderId(), ipAddress);

            VNPayPaymentResponse response = VNPayPaymentResponse.builder()
                    .code("00")
                    .message("Success")
                    .paymentUrl(paymentUrl)
                    .build();

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            log.error("Error creating payment URL", e);

            VNPayPaymentResponse response = VNPayPaymentResponse.builder()
                    .code("99")
                    .message(e.getMessage())
                    .build();

            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    /**
     * Handle VNPay payment callback (return URL)
     * This endpoint receives the redirect from VNPay after user completes payment
     * GET /api/vnpay/payment-callback?vnp_Amount=...&vnp_BankCode=...
     */
    @GetMapping("/payment-callback")
    public ResponseEntity<VNPayCallbackResponse> paymentCallback(@RequestParam Map<String, String> params) {
        log.info("Received VNPay payment callback with params: {}", params);

        try {
            VNPayCallbackResponse response = vnPayService.processCallbackWithDetails(params);

            if (response.getSuccess()) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }

        } catch (Exception e) {
            log.error("Error processing payment callback", e);

            VNPayCallbackResponse response = VNPayCallbackResponse.builder()
                    .success(false)
                    .message("Lỗi xử lý callback: " + e.getMessage())
                    .responseCode("99")
                    .build();

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Get client IP address from request
     */
    private String getClientIP(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null || xfHeader.isEmpty()) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0].trim();
    }
}
