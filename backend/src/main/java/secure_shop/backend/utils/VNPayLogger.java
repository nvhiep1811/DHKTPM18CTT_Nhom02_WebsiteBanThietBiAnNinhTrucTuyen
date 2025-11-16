package secure_shop.backend.utils;

import lombok.extern.slf4j.Slf4j;

import java.util.Map;
import java.util.TreeMap;

/**
 * VNPay Logger Utility
 * Provides formatted console logging for VNPay integration debugging
 */
@Slf4j
public class VNPayLogger {

    private static final String SEPARATOR = "=".repeat(100);
    private static final String LINE = "-".repeat(100);

    /**
     * Log payment request creation
     */
    public static void logPaymentRequest(String orderId, String txnRef, Long amount, String bankCode, String ipAddress) {
        log.info("\n{}\n🔵 VNPAY PAYMENT REQUEST\n{}", SEPARATOR, LINE);
        log.info("📋 Order ID       : {}", orderId);
        log.info("🔢 Transaction Ref: {}", txnRef);
        log.info("💰 Amount (VND)   : {} (x100 = {})", amount / 100, amount);
        log.info("🏦 Bank Code      : {}", bankCode != null ? bankCode : "ALL");
        log.info("🌐 IP Address     : {}", ipAddress);
        log.info("{}\n", SEPARATOR);
    }

    /**
     * Log payment parameters with sorting
     */
    public static void logPaymentParams(Map<String, String> params, String secretKey) {
        log.info("\n{}\n🔑 VNPAY PAYMENT PARAMETERS\n{}", SEPARATOR, LINE);

        // Sort parameters for better readability
        TreeMap<String, String> sortedParams = new TreeMap<>(params);

        sortedParams.forEach((key, value) -> {
            // Mask sensitive data
            if (key.equals("vnp_SecureHash")) {
                log.info("  {} = {}...{}", key, value.substring(0, 10), value.substring(value.length() - 10));
            } else {
                log.info("  {} = {}", key, value);
            }
        });

        log.info("\n🔐 Secret Key: {}...{}",
            secretKey.substring(0, 4),
            secretKey.substring(secretKey.length() - 4));
        log.info("{}\n", SEPARATOR);
    }

    /**
     * Log generated payment URL
     */
    public static void logPaymentUrl(String paymentUrl) {
        log.info("\n{}\n🌐 VNPAY PAYMENT URL GENERATED\n{}", SEPARATOR, LINE);

        // Split URL for better readability
        if (paymentUrl.contains("?")) {
            String[] parts = paymentUrl.split("\\?", 2);
            log.info("🔗 Base URL: {}", parts[0]);
            log.info("📝 Parameters:");

            String[] params = parts[1].split("&");
            for (String param : params) {
                if (param.contains("vnp_SecureHash=")) {
                    String hash = param.split("=")[1];
                    log.info("    {} = {}...{}",
                        param.split("=")[0],
                        hash.substring(0, Math.min(10, hash.length())),
                        hash.length() > 10 ? hash.substring(hash.length() - 10) : "");
                } else {
                    log.info("    {}", param.replace("=", " = "));
                }
            }
        } else {
            log.info("🔗 URL: {}", paymentUrl);
        }

        log.info("{}\n", SEPARATOR);
    }

    /**
     * Log payment callback from VNPay
     */
    public static void logCallback(Map<String, String> callbackParams) {
        log.info("\n{}\n⬅️  VNPAY CALLBACK RECEIVED\n{}", SEPARATOR, LINE);

        // Extract and log key information first
        String txnRef = callbackParams.get("vnp_TxnRef");
        String responseCode = callbackParams.get("vnp_ResponseCode");
        String transactionNo = callbackParams.get("vnp_TransactionNo");
        String amount = callbackParams.get("vnp_Amount");
        String orderInfo = callbackParams.get("vnp_OrderInfo");
        String payDate = callbackParams.get("vnp_PayDate");

        log.info("🔢 Transaction Ref : {}", txnRef);
        log.info("📊 Response Code   : {} ({})", responseCode, getResponseCodeMessage(responseCode));
        log.info("💳 Transaction No  : {}", transactionNo);
        log.info("💰 Amount          : {} (original: {})",
            amount != null ? Long.parseLong(amount) / 100 : 0, amount);
        log.info("📋 Order Info      : {}", orderInfo);
        log.info("📅 Payment Date    : {}", formatPaymentDate(payDate));

        log.info("\n📦 All Callback Parameters:");
        TreeMap<String, String> sortedParams = new TreeMap<>(callbackParams);
        sortedParams.forEach((key, value) -> {
            if (!key.equals("vnp_TxnRef") && !key.equals("vnp_ResponseCode") &&
                !key.equals("vnp_TransactionNo") && !key.equals("vnp_Amount") &&
                !key.equals("vnp_OrderInfo") && !key.equals("vnp_PayDate")) {

                if (key.equals("vnp_SecureHash")) {
                    log.info("  {} = {}...{}", key,
                        value.substring(0, Math.min(10, value.length())),
                        value.length() > 10 ? value.substring(value.length() - 10) : "");
                } else {
                    log.info("  {} = {}", key, value);
                }
            }
        });

        log.info("{}\n", SEPARATOR);
    }

    /**
     * Log signature verification
     */
    public static void logSignatureVerification(String receivedSignature, String calculatedSignature, boolean isValid) {
        log.info("\n{}\n🔐 VNPAY SIGNATURE VERIFICATION\n{}", SEPARATOR, LINE);
        log.info("📩 Received Signature  : {}...{}",
            receivedSignature.substring(0, Math.min(20, receivedSignature.length())),
            receivedSignature.length() > 20 ? receivedSignature.substring(receivedSignature.length() - 20) : "");
        log.info("🧮 Calculated Signature: {}...{}",
            calculatedSignature.substring(0, Math.min(20, calculatedSignature.length())),
            calculatedSignature.length() > 20 ? calculatedSignature.substring(calculatedSignature.length() - 20) : "");
        log.info("✅ Signature Valid     : {}", isValid ? "✓ YES" : "✗ NO");

        if (!isValid) {
            log.warn("⚠️  WARNING: Signature verification FAILED! This may indicate tampering or configuration issues.");
        }

        log.info("{}\n", SEPARATOR);
    }

    /**
     * Log IPN (Instant Payment Notification) processing
     */
    public static void logIPNProcessing(String orderId, String txnRef, String rspCode, String message) {
        log.info("\n{}\n📨 VNPAY IPN PROCESSING\n{}", SEPARATOR, LINE);
        log.info("📋 Order ID        : {}", orderId);
        log.info("🔢 Transaction Ref : {}", txnRef);
        log.info("📊 Response Code   : {} ({})", rspCode, getResponseCodeMessage(rspCode));
        log.info("💬 Message         : {}", message);
        log.info("{}\n", SEPARATOR);
    }

    /**
     * Log error during VNPay processing
     */
    public static void logError(String operation, String errorMessage, Exception exception) {
        log.error("\n{}\n❌ VNPAY ERROR - {}\n{}", SEPARATOR, operation, LINE);
        log.error("💬 Error Message: {}", errorMessage);
        if (exception != null) {
            log.error("🐛 Exception Type: {}", exception.getClass().getSimpleName());
            log.error("📝 Exception Details: {}", exception.getMessage());
            log.error("📚 Stack Trace:", exception);
        }
        log.error("{}\n", SEPARATOR);
    }

    /**
     * Log success operation
     */
    public static void logSuccess(String operation, String orderId, String transactionId, String amount) {
        log.info("\n{}\n✅ VNPAY SUCCESS - {}\n{}", SEPARATOR, operation, LINE);
        log.info("📋 Order ID       : {}", orderId);
        log.info("💳 Transaction ID : {}", transactionId);
        log.info("💰 Amount         : {}", amount);
        log.info("⏰ Timestamp      : {}", java.time.LocalDateTime.now());
        log.info("{}\n", SEPARATOR);
    }

    /**
     * Log payment status update
     */
    public static void logPaymentStatusUpdate(String orderId, String oldStatus, String newStatus, String reason) {
        log.info("\n{}\n🔄 VNPAY PAYMENT STATUS UPDATE\n{}", SEPARATOR, LINE);
        log.info("📋 Order ID    : {}", orderId);
        log.info("📊 Old Status  : {}", oldStatus);
        log.info("📊 New Status  : {}", newStatus);
        log.info("💬 Reason      : {}", reason);
        log.info("⏰ Timestamp   : {}", java.time.LocalDateTime.now());
        log.info("{}\n", SEPARATOR);
    }

    /**
     * Log raw query string for debugging
     */
    public static void logRawQueryString(String queryString) {
        log.debug("\n{}\n🔍 VNPAY RAW QUERY STRING\n{}", SEPARATOR, LINE);
        log.debug("{}", queryString);
        log.debug("{}\n", SEPARATOR);
    }

    /**
     * Get response code message in Vietnamese
     */
    private static String getResponseCodeMessage(String code) {
        if (code == null) return "Unknown";

        switch (code) {
            case "00":
                return "Giao dịch thành công";
            case "01":
                return "Giao dịch chưa hoàn tất";
            case "02":
                return "Giao dịch bị lỗi";
            case "04":
                return "Giao dịch đảo (Khách hàng đã bị trừ tiền tại Ngân hàng nhưng GD chưa thành công ở VNPAY)";
            case "05":
                return "VNPAY đang xử lý giao dịch này (GD hoàn tiền)";
            case "06":
                return "VNPAY đã gửi yêu cầu hoàn tiền sang Ngân hàng (GD hoàn tiền)";
            case "07":
                return "Giao dịch bị nghi ngờ gian lận";
            case "09":
                return "Giao dịch Hoàn trả bị từ chối";
            case "10":
                return "Đã giao hàng";
            case "11":
                return "Giao dịch bị hủy";
            case "12":
                return "Giao dịch bị khóa";
            case "24":
                return "Giao dịch bị hủy do khách hàng không xác nhận thanh toán";
            case "51":
                return "Tài khoản không đủ số dư";
            case "65":
                return "Tài khoản đã vượt quá giới hạn giao dịch trong ngày";
            case "75":
                return "Ngân hàng thanh toán đang bảo trì";
            case "79":
                return "KH nhập sai mật khẩu quá số lần quy định";
            case "99":
                return "Lỗi không xác định";
            default:
                return "Mã lỗi không xác định: " + code;
        }
    }

    /**
     * Format payment date from VNPay format (yyyyMMddHHmmss) to readable format
     */
    private static String formatPaymentDate(String payDate) {
        if (payDate == null || payDate.length() != 14) {
            return payDate;
        }

        try {
            return String.format("%s-%s-%s %s:%s:%s",
                payDate.substring(0, 4),   // year
                payDate.substring(4, 6),   // month
                payDate.substring(6, 8),   // day
                payDate.substring(8, 10),  // hour
                payDate.substring(10, 12), // minute
                payDate.substring(12, 14)  // second
            );
        } catch (Exception e) {
            return payDate;
        }
    }

    /**
     * Log hash data string before signing (for debugging signature issues)
     */
    public static void logHashData(String hashData) {
        log.debug("\n{}\n🔑 VNPAY HASH DATA STRING\n{}", SEPARATOR, LINE);
        log.debug("{}", hashData);
        log.debug("{}\n", SEPARATOR);
    }

    /**
     * Log query parameters map for debugging
     */
    public static void logParamsMap(String title, Map<String, String> params) {
        log.debug("\n{}\n📊 {} - PARAMETERS MAP\n{}", SEPARATOR, title, LINE);
        TreeMap<String, String> sortedParams = new TreeMap<>(params);
        sortedParams.forEach((key, value) -> {
            log.debug("  {} = {}", key, value);
        });
        log.debug("{}\n", SEPARATOR);
    }
}

