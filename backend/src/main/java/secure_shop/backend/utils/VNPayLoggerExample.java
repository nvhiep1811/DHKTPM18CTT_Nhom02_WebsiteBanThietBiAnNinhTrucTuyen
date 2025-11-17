package secure_shop.backend.utils;

import java.util.HashMap;
import java.util.Map;

/**
 * VNPay Logger Usage Examples
 * Demonstrates how to use VNPayLogger in various scenarios
 */
public class VNPayLoggerExample {

    /**
     * Example 1: Log payment request creation
     */
    public void exampleLogPaymentRequest() {
        VNPayLogger.logPaymentRequest(
            "550e8400-e29b-41d4-a716-446655440000",  // orderId
            "550e8400f38d9a2c",                       // txnRef
            150000000L,                               // amount (in VNPay format, x100)
            "NCB",                                    // bankCode
            "192.168.1.1"                            // ipAddress
        );
    }

    /**
     * Example 2: Log payment parameters with hash
     */
    public void exampleLogPaymentParams() {
        Map<String, String> params = new HashMap<>();
        params.put("vnp_Version", "2.1.0");
        params.put("vnp_Command", "pay");
        params.put("vnp_TmnCode", "3K5NU1SZ");
        params.put("vnp_Amount", "150000000");
        params.put("vnp_CurrCode", "VND");
        params.put("vnp_TxnRef", "550e8400f38d9a2c");
        params.put("vnp_OrderInfo", "Thanh toan don hang");
        params.put("vnp_SecureHash", "abcdef1234567890abcdef1234567890abcdef1234567890");

        String secretKey = "VLWMVO6J0A3V8LTTNO5Z4ALPXUZ8PEH9";

        VNPayLogger.logPaymentParams(params, secretKey);
    }

    /**
     * Example 3: Log payment URL
     */
    public void exampleLogPaymentUrl() {
        String paymentUrl = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?" +
            "vnp_Version=2.1.0&vnp_Command=pay&vnp_TmnCode=3K5NU1SZ&" +
            "vnp_Amount=150000000&vnp_SecureHash=abcdef1234567890";

        VNPayLogger.logPaymentUrl(paymentUrl);
    }

    /**
     * Example 4: Log callback from VNPay
     */
    public void exampleLogCallback() {
        Map<String, String> callbackParams = new HashMap<>();
        callbackParams.put("vnp_TxnRef", "550e8400f38d9a2c");
        callbackParams.put("vnp_ResponseCode", "00");
        callbackParams.put("vnp_TransactionNo", "14008498");
        callbackParams.put("vnp_Amount", "150000000");
        callbackParams.put("vnp_OrderInfo", "Thanh toan don hang - OrderID: 550e8400-e29b-41d4-a716-446655440000");
        callbackParams.put("vnp_PayDate", "20231116150842");
        callbackParams.put("vnp_BankCode", "NCB");
        callbackParams.put("vnp_CardType", "ATM");

        VNPayLogger.logCallback(callbackParams);
    }

    /**
     * Example 5: Log signature verification (success case)
     */
    public void exampleLogSignatureSuccess() {
        String receivedSignature = "abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890";
        String calculatedSignature = "abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890";
        boolean isValid = true;

        VNPayLogger.logSignatureVerification(receivedSignature, calculatedSignature, isValid);
    }

    /**
     * Example 6: Log signature verification (failure case)
     */
    public void exampleLogSignatureFailure() {
        String receivedSignature = "abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890";
        String calculatedSignature = "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
        boolean isValid = false;

        VNPayLogger.logSignatureVerification(receivedSignature, calculatedSignature, isValid);
    }

    /**
     * Example 7: Log payment status update
     */
    public void exampleLogPaymentStatusUpdate() {
        VNPayLogger.logPaymentStatusUpdate(
            "550e8400-e29b-41d4-a716-446655440000",  // orderId
            "PENDING",                                // oldStatus
            "PAID",                                   // newStatus
            "Payment successful via VNPay"            // reason
        );
    }

    /**
     * Example 8: Log success operation
     */
    public void exampleLogSuccess() {
        VNPayLogger.logSuccess(
            "PAYMENT COMPLETED",                      // operation
            "550e8400-e29b-41d4-a716-446655440000",  // orderId
            "14008498",                               // transactionId
            "150000000"                               // amount
        );
    }

    /**
     * Example 9: Log error with exception
     */
    public void exampleLogError() {
        try {
            // Simulate an error
            throw new RuntimeException("Order not found");
        } catch (Exception e) {
            VNPayLogger.logError(
                "CREATE PAYMENT URL",                 // operation
                "Failed to create payment URL",       // errorMessage
                e                                     // exception
            );
        }
    }

    /**
     * Example 10: Log IPN processing
     */
    public void exampleLogIPNProcessing() {
        VNPayLogger.logIPNProcessing(
            "550e8400-e29b-41d4-a716-446655440000",  // orderId
            "550e8400f38d9a2c",                       // txnRef
            "00",                                     // rspCode
            "IPN processed successfully"              // message
        );
    }

    /**
     * Example 11: Debug - Log raw query string
     */
    public void exampleLogRawQueryString() {
        String queryString = "vnp_Version=2.1.0&vnp_Command=pay&vnp_TmnCode=3K5NU1SZ&" +
            "vnp_Amount=150000000&vnp_CurrCode=VND";

        VNPayLogger.logRawQueryString(queryString);
    }

    /**
     * Example 12: Debug - Log hash data
     */
    public void exampleLogHashData() {
        String hashData = "vnp_Amount=150000000&vnp_Command=pay&vnp_CurrCode=VND&" +
            "vnp_TmnCode=3K5NU1SZ&vnp_Version=2.1.0";

        VNPayLogger.logHashData(hashData);
    }

    /**
     * Example 13: Debug - Log parameters map
     */
    public void exampleLogParamsMap() {
        Map<String, String> params = new HashMap<>();
        params.put("vnp_Version", "2.1.0");
        params.put("vnp_Command", "pay");
        params.put("vnp_Amount", "150000000");

        VNPayLogger.logParamsMap("Before Signing", params);
    }

    /**
     * Complete workflow example
     */
    public void exampleCompleteWorkflow() {
        // Step 1: Log payment request
        VNPayLogger.logPaymentRequest(
            "550e8400-e29b-41d4-a716-446655440000",
            "550e8400f38d9a2c",
            150000000L,
            "NCB",
            "192.168.1.1"
        );

        // Step 2: Build and log parameters
        Map<String, String> params = new HashMap<>();
        params.put("vnp_Version", "2.1.0");
        params.put("vnp_Command", "pay");
        params.put("vnp_Amount", "150000000");
        VNPayLogger.logPaymentParams(params, "SECRET_KEY");

        // Step 3: Log payment URL
        String paymentUrl = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?...";
        VNPayLogger.logPaymentUrl(paymentUrl);

        // Step 4: Later, when callback is received
        Map<String, String> callbackParams = new HashMap<>();
        callbackParams.put("vnp_ResponseCode", "00");
        callbackParams.put("vnp_TransactionNo", "14008498");
        VNPayLogger.logCallback(callbackParams);

        // Step 5: Verify signature
        VNPayLogger.logSignatureVerification(
            "received_hash",
            "calculated_hash",
            true
        );

        // Step 6: Update payment status
        VNPayLogger.logPaymentStatusUpdate(
            "550e8400-e29b-41d4-a716-446655440000",
            "PENDING",
            "PAID",
            "Payment successful"
        );

        // Step 7: Log success
        VNPayLogger.logSuccess(
            "PAYMENT COMPLETED",
            "550e8400-e29b-41d4-a716-446655440000",
            "14008498",
            "150000000"
        );
    }

    /**
     * Main method to run examples
     */
    public static void main(String[] args) {
        VNPayLoggerExample example = new VNPayLoggerExample();

        System.out.println("=== VNPay Logger Examples ===\n");

        System.out.println("\n--- Example 1: Payment Request ---");
        example.exampleLogPaymentRequest();

        System.out.println("\n--- Example 2: Payment Parameters ---");
        example.exampleLogPaymentParams();

        System.out.println("\n--- Example 3: Payment URL ---");
        example.exampleLogPaymentUrl();

        System.out.println("\n--- Example 4: Callback ---");
        example.exampleLogCallback();

        System.out.println("\n--- Example 5: Signature Success ---");
        example.exampleLogSignatureSuccess();

        System.out.println("\n--- Example 6: Signature Failure ---");
        example.exampleLogSignatureFailure();

        System.out.println("\n--- Example 7: Status Update ---");
        example.exampleLogPaymentStatusUpdate();

        System.out.println("\n--- Example 8: Success ---");
        example.exampleLogSuccess();

        System.out.println("\n--- Example 9: Error ---");
        example.exampleLogError();

        System.out.println("\n--- Example 10: IPN Processing ---");
        example.exampleLogIPNProcessing();
    }
}

