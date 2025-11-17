package secure_shop.backend.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import secure_shop.backend.config.VNPayConfig;
import secure_shop.backend.dto.vnpay.VNPayCallbackResponse;
import secure_shop.backend.entities.Order;
import secure_shop.backend.entities.Payment;
import secure_shop.backend.enums.OrderStatus;
import secure_shop.backend.enums.PaymentMethod;
import secure_shop.backend.enums.PaymentProvider;
import secure_shop.backend.enums.PaymentStatus;
import secure_shop.backend.mapper.OrderMapper;
import secure_shop.backend.mapper.PaymentMapper;
import secure_shop.backend.repositories.OrderRepository;
import secure_shop.backend.repositories.PaymentRepository;
import secure_shop.backend.service.EmailService;
import secure_shop.backend.service.VNPayService;

import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.time.Instant;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class VNPayServiceImpl implements VNPayService {

    private final VNPayConfig vnPayConfig;
    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final OrderMapper orderMapper;
    private final PaymentMapper paymentMapper;
    private final EmailService emailService;

    @Transactional
    public String createPaymentUrl(UUID orderId, String ipAddress) throws UnsupportedOperationException{
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));

        // Check if payment already exists
        Optional<Payment> existingPayment = paymentRepository.findByOrderId(orderId);
        if (existingPayment.isPresent() && existingPayment.get().getStatus() == PaymentStatus.PAID) {
            throw new RuntimeException("Đơn hàng đã được thanh toán");
        }
        order.recalculateTotals();
        long amount = order.getGrandTotal().multiply(BigDecimal.valueOf(100)).longValue();

        // Build VNPay parameters
        Map<String, String> vnpParams = new HashMap<>();
        vnpParams.put("vnp_Version", vnPayConfig.getVnpVersion());
        vnpParams.put("vnp_Command", vnPayConfig.getVnpCommand());
        vnpParams.put("vnp_TmnCode", vnPayConfig.getVnpTmnCode());
        vnpParams.put("vnp_Amount", String.valueOf(amount));
        vnpParams.put("vnp_CurrCode", "VND");
        vnpParams.put("vnp_BankCode", "");

        String vnpTxnRef = UUID.randomUUID().toString();
        vnpParams.put("vnp_TxnRef", vnpTxnRef);
        vnpParams.put("vnp_OrderInfo", "Thanh toan don hang: " + orderId);
        vnpParams.put("vnp_OrderType", "other");
        vnpParams.put("vnp_Locale", "vn");
        vnpParams.put("vnp_ReturnUrl", vnPayConfig.getVnpReturnUrl());
        vnpParams.put("vnp_IpAddr", ipAddress);

        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        String vnpCreateDate = formatter.format(cld.getTime());
        vnpParams.put("vnp_CreateDate", vnpCreateDate);

        cld.add(Calendar.MINUTE, 15);
        String vnpExpireDate = formatter.format(cld.getTime());
        vnpParams.put("vnp_ExpireDate", vnpExpireDate);

        // Create or update payment record
        Payment payment;
        if (existingPayment.isPresent()) {
            payment = existingPayment.get();
            payment.setTransactionId(vnpTxnRef);
            payment.setStatus(PaymentStatus.PENDING);
        } else {
            payment = Payment.builder()
                    .order(order)
                    .amount(order.getGrandTotal())
                    .method(PaymentMethod.E_WALLET)
                    .provider(PaymentProvider.VNPAY)
                    .status(PaymentStatus.PENDING)
                    .transactionId(vnpTxnRef)
                    .gatewayResponse(new HashMap<>())
                    .build();
        }

        paymentRepository.save(payment);
        log.info("Created payment with transaction ID: {}", vnpTxnRef);

        // TẠO CHỮ KÝ
        String vnp_SecureHash = vnPayConfig.hashAllFields(vnpParams);
        vnpParams.put("vnp_SecureHash", vnp_SecureHash);

        // TẠO URL THANH TOÁN HOÀN CHỈNH
        StringBuilder paymentUrl = new StringBuilder(vnPayConfig.getVnpUrl());
        paymentUrl.append("?");

        List<String> fieldNames = new ArrayList<>(vnpParams.keySet());
        Collections.sort(fieldNames); // Vẫn cần sort để VNPAY nhận diện

        for (int i = 0; i < fieldNames.size(); i++) {
            String fieldName = fieldNames.get(i);
            String fieldValue = vnpParams.get(fieldName);
            if (fieldValue != null && !fieldValue.isEmpty()) {
                paymentUrl.append(URLEncoder.encode(fieldName, StandardCharsets.UTF_8))
                        .append("=")
                        .append(URLEncoder.encode(fieldValue, StandardCharsets.UTF_8));
                if (i < fieldNames.size() - 1) {
                    paymentUrl.append("&");
                }
            }
        }

        // TRẢ VỀ URL HOÀN CHỈNH
        return paymentUrl.toString();
    }

    @Override
    @Transactional
    public VNPayCallbackResponse processCallbackWithDetails(Map<String, String> params) {
        log.info("Processing VNPay callback with details: {}", params);

        String vnpSecureHash = params.get("vnp_SecureHash");
        String responseCode = params.get("vnp_ResponseCode");
        String txnRef = params.get("vnp_TxnRef");
        String transactionNo = params.get("vnp_TransactionNo");

        // Create response builder
        VNPayCallbackResponse.VNPayCallbackResponseBuilder responseBuilder = VNPayCallbackResponse.builder()
                .responseCode(responseCode)
                .txnRef(txnRef)
                .transactionId(transactionNo);

        // Remove hash params for validation
        Map<String, String> paramsForValidation = new HashMap<>(params);
        paramsForValidation.remove("vnp_SecureHash");
        paramsForValidation.remove("vnp_SecureHashType");

        // Build hash data
        List<String> fieldNames = new ArrayList<>(paramsForValidation.keySet());
        Collections.sort(fieldNames);

        StringBuilder hashData = new StringBuilder();
        for (String fieldName : fieldNames) {
            String fieldValue = paramsForValidation.get(fieldName);
            if (fieldValue != null && !fieldValue.isEmpty()) {
                hashData.append(fieldName)
                        .append('=')
                        .append(URLEncoder.encode(fieldValue, StandardCharsets.UTF_8));
                if (fieldNames.indexOf(fieldName) < fieldNames.size() - 1) {
                    hashData.append('&');
                }
            }
        }

        // Verify signature
        String signValue = VNPayConfig.hmacSHA512(vnPayConfig.getVnpHashSecret(), hashData.toString());

        if (!signValue.equals(vnpSecureHash)) {
            log.error("Invalid signature. Expected: {}, Got: {}", signValue, vnpSecureHash);
            return responseBuilder
                    .success(false)
                    .message("Chữ ký không hợp lệ")
                    .build();
        }

        try {
            // Find payment by transaction reference
            Payment payment = paymentRepository.findByTransactionId(txnRef)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy giao dịch với txnRef: " + txnRef));

            // Store gateway response as JSONB
            Map<String, Object> gatewayResponse = new HashMap<>(params);
            payment.setGatewayResponse(gatewayResponse);

            // Update payment and order status
            if ("00".equals(responseCode)) {
                payment.setStatus(PaymentStatus.PAID);
                payment.setPaidAt(Instant.now());

                // Update order
                Order order = payment.getOrder();
                order.setPaymentStatus(PaymentStatus.PAID);
                order.setStatus(OrderStatus.CONFIRMED);
                order.setHasPaid(true);
                order.setConfirmedAt(Instant.now());
                orderRepository.save(order);

                log.info("Payment successful for transaction: {}", txnRef);

                // Build success response with order and payment details
                paymentRepository.save(payment);

                try {
                    emailService.sendOrderConfirmationEmail(order);
                } catch (Exception ex) {
                    log.error("Failed to send order confirmation email for order: {}", order.getId(), ex);
                }

                return responseBuilder
                        .success(true)
                        .message("Thanh toán thành công")
                        .order(orderMapper.toDTO(order))
                        .payment(paymentMapper.toDTO(payment))
                        .build();

            } else {
                payment.setStatus(PaymentStatus.FAILED);
                payment.getOrder().setPaymentStatus(PaymentStatus.FAILED);

                log.warn("Payment failed for transaction: {} with code: {}", txnRef, responseCode);

                paymentRepository.save(payment);

                return responseBuilder
                        .success(false)
                        .message(getResponseCodeMessage(responseCode))
                        .order(orderMapper.toDTO(payment.getOrder()))
                        .payment(paymentMapper.toDTO(payment))
                        .build();
            }

        } catch (Exception e) {
            log.error("Error processing payment callback", e);
            return responseBuilder
                    .success(false)
                    .message("Lỗi xử lý thanh toán: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Get user-friendly message for VNPay response code
     */
    private String getResponseCodeMessage(String responseCode) {
        return switch (responseCode) {
            case "00" -> "Giao dịch thành công";
            case "07" -> "Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường)";
            case "09" -> "Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng";
            case "10" -> "Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần";
            case "11" -> "Giao dịch không thành công do: Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch";
            case "12" -> "Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa";
            case "13" -> "Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch (OTP)";
            case "24" -> "Giao dịch không thành công do: Khách hàng hủy giao dịch";
            case "51" -> "Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch";
            case "65" -> "Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày";
            case "75" -> "Ngân hàng thanh toán đang bảo trì";
            case "79" -> "Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định";
            default -> "Giao dịch không thành công. Mã lỗi: " + responseCode;
        };
    }

//    @Override
//    @Transactional
//    public VNPayIPNResponse processIPN(Map<String, String> params) {
//        // Log IPN received
//        VNPayLogger.logCallback(params);
//        log.info("Processing VNPay IPN with params: {}", params);
//
//        String vnp_SecureHash = params.get("vnp_SecureHash");
//        String vnp_TxnRef = params.get("vnp_TxnRef");
//        String vnp_Amount = params.get("vnp_Amount");
//        String vnp_ResponseCode = params.get("vnp_ResponseCode");
//        String vnp_TransactionStatus = params.get("vnp_TransactionStatus");
//
//        // Remove hash params for validation
//        params.remove("vnp_SecureHashType");
//        params.remove("vnp_SecureHash");
//
//        // Validate signature
//        if (!validateSignature(params, vnp_SecureHash)) {
//            log.error("Invalid VNPay IPN signature");
//            return VNPayIPNResponse.invalidSignature();
//        }
//
//        // Find order by transaction reference (extract order ID from vnp_TxnRef or vnp_OrderInfo)
//        String orderInfo = params.get("vnp_OrderInfo");
//        UUID orderId = extractOrderIdFromOrderInfo(orderInfo);
//
//        if (orderId == null) {
//            log.error("Cannot extract order ID from IPN");
//            return VNPayIPNResponse.orderNotFound();
//        }
//
//        Order order = orderRepository.findById(orderId).orElse(null);
//        if (order == null) {
//            log.error("Order not found: {}", orderId);
//            return VNPayIPNResponse.orderNotFound();
//        }
//
//        // Check amount
//        long vnpAmount = Long.parseLong(vnp_Amount) / 100; // Convert back from VNPay format
//        BigDecimal vnpAmountVND = BigDecimal.valueOf(vnpAmount);
//        if (order.getGrandTotal() == null || order.getGrandTotal().compareTo(vnpAmountVND) != 0) {
//            log.error("Amount mismatch. Order: {}, VNPay: {}", order.getGrandTotal(), vnpAmountVND);
//            return VNPayIPNResponse.invalidAmount();
//        }
//
//        // Check if already processed
//        Payment existingPayment = paymentRepository.findByOrderId(orderId).orElse(null);
//        if (existingPayment != null && existingPayment.getStatus() == PaymentStatus.PAID) {
//            log.info("Payment already confirmed for order: {}", orderId);
//            return VNPayIPNResponse.orderAlreadyConfirmed();
//        }
//
//        // Update payment
//        VNPayCallbackRequest callback = VNPayCallbackRequest.builder()
//                .vnp_TxnRef(vnp_TxnRef)
//                .vnp_Amount(vnp_Amount)
//                .vnp_ResponseCode(vnp_ResponseCode)
//                .vnp_TransactionStatus(vnp_TransactionStatus)
//                .vnp_TransactionNo(params.get("vnp_TransactionNo"))
//                .vnp_BankCode(params.get("vnp_BankCode"))
//                .vnp_PayDate(params.get("vnp_PayDate"))
//                .allParams(new HashMap<>(params))
//                .build();
//
//        updatePaymentStatus(callback);
//
//        log.info("VNPay IPN processed successfully for order: {}", orderId);
//        return VNPayIPNResponse.success();
//    }


//    @Override
//    public boolean validateSignature(Map<String, String> params, String secureHash) {
//        String calculatedHash = VNPayUtil.hashAllFields(params, vnPayConfig.getSecretKey());
//        boolean isValid = calculatedHash.equals(secureHash);
//
//        // Log signature verification
//        VNPayLogger.logSignatureVerification(secureHash, calculatedHash, isValid);
//
//        log.debug("Signature validation - Calculated: {}, Received: {}, Valid: {}",
//                calculatedHash, secureHash, isValid);
//
//        return isValid;
//    }

//    @Override
//    public Map<String, String> queryTransaction(UUID orderId, String transactionDate) {
//        // TODO: Implement transaction query API call to VNPay
//        // This requires sending a request to vnp_ApiUrl with proper authentication
//        throw new UnsupportedOperationException("Transaction query not yet implemented");
//    }

//    /**
//     * Update payment status based on VNPay callback
//     */
//    private void updatePaymentStatus(VNPayCallbackRequest callback) {
//        try {
//            // Extract order ID from order info
//            String orderInfo = callback.getAllParams().get("vnp_OrderInfo");
//            UUID orderId = extractOrderIdFromOrderInfo(orderInfo);
//
//            if (orderId == null) {
//                log.error("Cannot extract order ID from callback");
//                return;
//            }
//
//            Order order = orderRepository.findById(orderId)
//                    .orElseThrow(() -> new ResourceNotFoundException("Order", orderId));
//
//            // Find or create payment
//            Payment payment = paymentRepository.findByOrderId(orderId)
//                    .orElseGet(() -> {
//                        Payment newPayment = new Payment();
//                        newPayment.setOrder(order);
//                        newPayment.setMethod(PaymentMethod.E_WALLET);
//                        newPayment.setProvider(PaymentProvider.VNPAY);
//                        newPayment.setAmount(order.getGrandTotal());
//                        newPayment.setStatus(PaymentStatus.UNPAID);
//                        return newPayment;
//                    });
//
//            // Update payment details
//            payment.setTransactionId(callback.getVnp_TransactionNo());
//
//            // Store gateway response
//            Map<String, Object> gatewayResponse = new HashMap<>(callback.getAllParams());
//            payment.setGatewayResponse(gatewayResponse);
//
//            // Update status based on response code
//            if (callback.isSuccess()) {
//                PaymentStatus oldStatus = payment.getStatus();
//                payment.setStatus(PaymentStatus.PAID);
//                payment.setPaidAt(parseVNPayDate(callback.getVnp_PayDate()));
//                order.setPaymentStatus(secure_shop.backend.enums.PaymentStatus.PAID);
//                order.setHasPaid(true);
//
//                // Log payment status update
//                VNPayLogger.logPaymentStatusUpdate(
//                    orderId.toString(),
//                    oldStatus != null ? oldStatus.toString() : "NEW",
//                    "PAID",
//                    "Payment successful via VNPay"
//                );
//
//                // Log success
//                VNPayLogger.logSuccess(
//                    "PAYMENT COMPLETED",
//                    orderId.toString(),
//                    callback.getVnp_TransactionNo(),
//                    callback.getVnp_Amount()
//                );
//
//                log.info("Payment successful for order: {}, transactionId: {}",
//                        orderId, callback.getVnp_TransactionNo());
//            } else {
//                PaymentStatus oldStatus = payment.getStatus();
//                payment.setStatus(PaymentStatus.FAILED);
//                order.setPaymentStatus(secure_shop.backend.enums.PaymentStatus.FAILED);
//
//                // Log payment status update
//                VNPayLogger.logPaymentStatusUpdate(
//                    orderId.toString(),
//                    oldStatus != null ? oldStatus.toString() : "NEW",
//                    "FAILED",
//                    "Payment failed - Response code: " + callback.getVnp_ResponseCode()
//                );
//
//                log.warn("Payment failed for order: {}, responseCode: {}",
//                        orderId, callback.getVnp_ResponseCode());
//            }
//
//            paymentRepository.save(payment);
//            orderRepository.save(order);
//
//        } catch (Exception e) {
//            VNPayLogger.logError("UPDATE PAYMENT STATUS", e.getMessage(), e);
//            log.error("Error updating payment status", e);
//            throw new RuntimeException("Failed to update payment status", e);
//        }
//    }

    /**
     * Extract order ID from VNPay order info string
     */
//    private UUID extractOrderIdFromOrderInfo(String orderInfo) {
//        try {
//            // Order info format: "Thanh toan don hang - OrderID: uuid"
//            if (orderInfo != null && orderInfo.contains("OrderID:")) {
//                String[] parts = orderInfo.split("OrderID:");
//                if (parts.length > 1) {
//                    String uuidStr = parts[1].trim();
//                    return UUID.fromString(uuidStr);
//                }
//            }
//            return null;
//        } catch (Exception e) {
//            log.error("Error extracting order ID from: {}", orderInfo, e);
//            return null;
//        }
//    }
//
//    /**
//     * Parse VNPay date format (yyyyMMddHHmmss) to Instant
//     */
//    private Instant parseVNPayDate(String vnpayDate) {
//        try {
//            if (vnpayDate == null || vnpayDate.isEmpty()) {
//                return Instant.now();
//            }
//            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
//            LocalDateTime dateTime = LocalDateTime.parse(vnpayDate, formatter);
//            return dateTime.atZone(ZoneId.of("Asia/Ho_Chi_Minh")).toInstant();
//        } catch (Exception e) {
//            log.error("Error parsing VNPay date: {}", vnpayDate, e);
//            return Instant.now();
//        }
//    }
}
