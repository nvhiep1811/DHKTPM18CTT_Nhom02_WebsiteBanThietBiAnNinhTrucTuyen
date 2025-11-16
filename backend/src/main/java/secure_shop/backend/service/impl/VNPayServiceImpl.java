package secure_shop.backend.service.impl;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import secure_shop.backend.config.VNPayConfig;
import secure_shop.backend.dto.vnpay.VNPayCallbackRequest;
import secure_shop.backend.dto.vnpay.VNPayIPNResponse;
import secure_shop.backend.dto.vnpay.VNPayPaymentRequest;
import secure_shop.backend.dto.vnpay.VNPayPaymentResponse;
import secure_shop.backend.entities.Order;
import secure_shop.backend.entities.Payment;
import secure_shop.backend.enums.PaymentMethod;
import secure_shop.backend.enums.PaymentProvider;
import secure_shop.backend.enums.PaymentStatus;
import secure_shop.backend.exception.ResourceNotFoundException;
import secure_shop.backend.repositories.OrderRepository;
import secure_shop.backend.repositories.PaymentRepository;
import secure_shop.backend.service.VNPayService;
import secure_shop.backend.utils.VNPayUtil;

import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class VNPayServiceImpl implements VNPayService {

    private final VNPayConfig vnPayConfig;
    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;

    @Override
    public VNPayPaymentResponse createPaymentUrl(VNPayPaymentRequest request, HttpServletRequest httpRequest, UUID currentUserId) {
        try {
            Order order = orderRepository.findById(request.getOrderId())
                    .orElseThrow(() -> new ResourceNotFoundException("Order", request.getOrderId()));

            // Ownership check
            if (order.getUser() == null || !order.getUser().getId().equals(currentUserId)) {
                log.warn("User {} attempted to create payment for order {} they do not own", currentUserId, order.getId());
                return VNPayPaymentResponse.builder()
                        .code("403")
                        .message("Forbidden: order does not belong to current user")
                        .paymentUrl(null)
                        .build();
            }

            // Already paid check
            if (Boolean.TRUE.equals(order.getHasPaid()) || order.getPaymentStatus() == secure_shop.backend.enums.PaymentStatus.PAID) {
                log.info("Order {} already paid. Denying new payment URL request", order.getId());
                return VNPayPaymentResponse.builder()
                        .code("409")
                        .message("Order already paid")
                        .paymentUrl(null)
                        .build();
            }

            // Generate transaction reference
            String vnp_TxnRef = order.getId().toString().replace("-", "").substring(0, 8) + VNPayUtil.getRandomNumber(8);

            // Always use server-side computed amount from order to avoid client tampering
            BigDecimal orderAmountVND = order.getGrandTotal() != null ? order.getGrandTotal() : BigDecimal.ZERO;
            long amountForVNPay = orderAmountVND.movePointRight(2).longValue(); // amount * 100

            // Build payment parameters
            Map<String, String> vnp_Params = new HashMap<>();
            vnp_Params.put("vnp_Version", vnPayConfig.getVersion());
            vnp_Params.put("vnp_Command", vnPayConfig.getCommand());
            vnp_Params.put("vnp_TmnCode", vnPayConfig.getTmnCode());
            vnp_Params.put("vnp_Amount", String.valueOf(amountForVNPay));
            vnp_Params.put("vnp_CurrCode", "VND");

            if (request.getBankCode() != null && !request.getBankCode().isEmpty()) {
                vnp_Params.put("vnp_BankCode", request.getBankCode());
            }

            vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
            vnp_Params.put("vnp_OrderInfo", request.getOrderInfo() + " - OrderID: " + order.getId());
            vnp_Params.put("vnp_OrderType", request.getOrderType());
            vnp_Params.put("vnp_Locale", request.getLanguage());
            vnp_Params.put("vnp_ReturnUrl", vnPayConfig.getReturnUrl());
            vnp_Params.put("vnp_IpAddr", VNPayUtil.getIpAddress(httpRequest));

            // Add timestamp
            Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
            SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
            String vnp_CreateDate = formatter.format(cld.getTime());
            vnp_Params.put("vnp_CreateDate", vnp_CreateDate);

            // Add expiration time (15 minutes)
            cld.add(Calendar.MINUTE, 15);
            String vnp_ExpireDate = formatter.format(cld.getTime());
            vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);

            // Build query string and hash
            String queryUrl = VNPayUtil.buildQueryUrl(vnp_Params);
            String vnp_SecureHash = VNPayUtil.hashAllFields(vnp_Params, vnPayConfig.getSecretKey());
            queryUrl += "&vnp_SecureHash=" + vnp_SecureHash;

            String paymentUrl = vnPayConfig.getPaymentUrl() + "?" + queryUrl;

            log.info("Created VNPay payment URL for order: {}, txnRef: {}", order.getId(), vnp_TxnRef);

            return VNPayPaymentResponse.builder()
                    .code("00")
                    .message("success")
                    .paymentUrl(paymentUrl)
                    .build();

        } catch (Exception e) {
            log.error("Error creating VNPay payment URL", e);
            return VNPayPaymentResponse.builder()
                    .code("99")
                    .message("Error: " + e.getMessage())
                    .paymentUrl(null)
                    .build();
        }
    }

    @Override
    @Transactional
    public VNPayCallbackRequest processCallback(Map<String, String> params) {
        log.info("Processing VNPay callback with params: {}", params);

        String vnp_SecureHash = params.get("vnp_SecureHash");
        params.remove("vnp_SecureHashType");
        params.remove("vnp_SecureHash");

        // Validate signature
        boolean isValid = validateSignature(params, vnp_SecureHash);

        if (!isValid) {
            log.error("Invalid VNPay signature");
            throw new IllegalArgumentException("Invalid payment signature");
        }

        // Build callback request
        VNPayCallbackRequest callback = VNPayCallbackRequest.builder()
                .vnp_TmnCode(params.get("vnp_TmnCode"))
                .vnp_Amount(params.get("vnp_Amount"))
                .vnp_BankCode(params.get("vnp_BankCode"))
                .vnp_BankTranNo(params.get("vnp_BankTranNo"))
                .vnp_CardType(params.get("vnp_CardType"))
                .vnp_PayDate(params.get("vnp_PayDate"))
                .vnp_OrderInfo(params.get("vnp_OrderInfo"))
                .vnp_TransactionNo(params.get("vnp_TransactionNo"))
                .vnp_ResponseCode(params.get("vnp_ResponseCode"))
                .vnp_TransactionStatus(params.get("vnp_TransactionStatus"))
                .vnp_TxnRef(params.get("vnp_TxnRef"))
                .vnp_SecureHash(vnp_SecureHash)
                .allParams(new HashMap<>(params))
                .build();

        // Update payment status
        updatePaymentStatus(callback);

        return callback;
    }

    @Override
    @Transactional
    public VNPayIPNResponse processIPN(Map<String, String> params) {
        log.info("Processing VNPay IPN with params: {}", params);

        String vnp_SecureHash = params.get("vnp_SecureHash");
        String vnp_TxnRef = params.get("vnp_TxnRef");
        String vnp_Amount = params.get("vnp_Amount");
        String vnp_ResponseCode = params.get("vnp_ResponseCode");
        String vnp_TransactionStatus = params.get("vnp_TransactionStatus");

        // Remove hash params for validation
        params.remove("vnp_SecureHashType");
        params.remove("vnp_SecureHash");

        // Validate signature
        if (!validateSignature(params, vnp_SecureHash)) {
            log.error("Invalid VNPay IPN signature");
            return VNPayIPNResponse.invalidSignature();
        }

        // Find order by transaction reference (extract order ID from vnp_TxnRef or vnp_OrderInfo)
        String orderInfo = params.get("vnp_OrderInfo");
        UUID orderId = extractOrderIdFromOrderInfo(orderInfo);

        if (orderId == null) {
            log.error("Cannot extract order ID from IPN");
            return VNPayIPNResponse.orderNotFound();
        }

        Order order = orderRepository.findById(orderId).orElse(null);
        if (order == null) {
            log.error("Order not found: {}", orderId);
            return VNPayIPNResponse.orderNotFound();
        }

        // Check amount
        Long vnpAmount = Long.parseLong(vnp_Amount) / 100; // Convert back from VNPay format
        BigDecimal vnpAmountVND = BigDecimal.valueOf(vnpAmount);
        if (order.getGrandTotal() == null || order.getGrandTotal().compareTo(vnpAmountVND) != 0) {
            log.error("Amount mismatch. Order: {}, VNPay: {}", order.getGrandTotal(), vnpAmountVND);
            return VNPayIPNResponse.invalidAmount();
        }

        // Check if already processed
        Payment existingPayment = paymentRepository.findByOrderId(orderId).orElse(null);
        if (existingPayment != null && existingPayment.getStatus() == PaymentStatus.PAID) {
            log.info("Payment already confirmed for order: {}", orderId);
            return VNPayIPNResponse.orderAlreadyConfirmed();
        }

        // Update payment
        VNPayCallbackRequest callback = VNPayCallbackRequest.builder()
                .vnp_TxnRef(vnp_TxnRef)
                .vnp_Amount(vnp_Amount)
                .vnp_ResponseCode(vnp_ResponseCode)
                .vnp_TransactionStatus(vnp_TransactionStatus)
                .vnp_TransactionNo(params.get("vnp_TransactionNo"))
                .vnp_BankCode(params.get("vnp_BankCode"))
                .vnp_PayDate(params.get("vnp_PayDate"))
                .allParams(new HashMap<>(params))
                .build();

        updatePaymentStatus(callback);

        log.info("VNPay IPN processed successfully for order: {}", orderId);
        return VNPayIPNResponse.success();
    }

    @Override
    public boolean validateSignature(Map<String, String> params, String secureHash) {
        String calculatedHash = VNPayUtil.hashAllFields(params, vnPayConfig.getSecretKey());
        boolean isValid = calculatedHash.equals(secureHash);

        log.debug("Signature validation - Calculated: {}, Received: {}, Valid: {}",
                calculatedHash, secureHash, isValid);

        return isValid;
    }

    @Override
    public Map<String, String> queryTransaction(UUID orderId, String transactionDate) {
        // TODO: Implement transaction query API call to VNPay
        // This requires sending a request to vnp_ApiUrl with proper authentication
        throw new UnsupportedOperationException("Transaction query not yet implemented");
    }

    /**
     * Update payment status based on VNPay callback
     */
    private void updatePaymentStatus(VNPayCallbackRequest callback) {
        try {
            // Extract order ID from order info
            String orderInfo = callback.getAllParams().get("vnp_OrderInfo");
            UUID orderId = extractOrderIdFromOrderInfo(orderInfo);

            if (orderId == null) {
                log.error("Cannot extract order ID from callback");
                return;
            }

            Order order = orderRepository.findById(orderId)
                    .orElseThrow(() -> new ResourceNotFoundException("Order", orderId));

            // Find or create payment
            Payment payment = paymentRepository.findByOrderId(orderId)
                    .orElseGet(() -> {
                        Payment newPayment = new Payment();
                        newPayment.setOrder(order);
                        newPayment.setMethod(PaymentMethod.E_WALLET);
                        newPayment.setProvider(PaymentProvider.VNPAY);
                        newPayment.setAmount(order.getGrandTotal());
                        newPayment.setStatus(PaymentStatus.UNPAID);
                        return newPayment;
                    });

            // Update payment details
            payment.setTransactionId(callback.getVnp_TransactionNo());

            // Store gateway response
            Map<String, Object> gatewayResponse = new HashMap<>(callback.getAllParams());
            payment.setGatewayResponse(gatewayResponse);

            // Update status based on response code
            if (callback.isSuccess()) {
                payment.setStatus(PaymentStatus.PAID);
                payment.setPaidAt(parseVNPayDate(callback.getVnp_PayDate()));
                order.setPaymentStatus(secure_shop.backend.enums.PaymentStatus.PAID);
                order.setHasPaid(true);

                log.info("Payment successful for order: {}, transactionId: {}",
                        orderId, callback.getVnp_TransactionNo());
            } else {
                payment.setStatus(PaymentStatus.FAILED);
                order.setPaymentStatus(secure_shop.backend.enums.PaymentStatus.FAILED);

                log.warn("Payment failed for order: {}, responseCode: {}",
                        orderId, callback.getVnp_ResponseCode());
            }

            paymentRepository.save(payment);
            orderRepository.save(order);

        } catch (Exception e) {
            log.error("Error updating payment status", e);
            throw new RuntimeException("Failed to update payment status", e);
        }
    }

    /**
     * Extract order ID from VNPay order info string
     */
    private UUID extractOrderIdFromOrderInfo(String orderInfo) {
        try {
            // Order info format: "Thanh toan don hang - OrderID: uuid"
            if (orderInfo != null && orderInfo.contains("OrderID:")) {
                String[] parts = orderInfo.split("OrderID:");
                if (parts.length > 1) {
                    String uuidStr = parts[1].trim();
                    return UUID.fromString(uuidStr);
                }
            }
            return null;
        } catch (Exception e) {
            log.error("Error extracting order ID from: {}", orderInfo, e);
            return null;
        }
    }

    /**
     * Parse VNPay date format (yyyyMMddHHmmss) to Instant
     */
    private Instant parseVNPayDate(String vnpayDate) {
        try {
            if (vnpayDate == null || vnpayDate.isEmpty()) {
                return Instant.now();
            }
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
            LocalDateTime dateTime = LocalDateTime.parse(vnpayDate, formatter);
            return dateTime.atZone(ZoneId.of("Asia/Ho_Chi_Minh")).toInstant();
        } catch (Exception e) {
            log.error("Error parsing VNPay date: {}", vnpayDate, e);
            return Instant.now();
        }
    }
}
