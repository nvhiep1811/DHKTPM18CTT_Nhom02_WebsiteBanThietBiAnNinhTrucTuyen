package secure_shop.backend.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import secure_shop.backend.config.VNPayConfig;
import secure_shop.backend.dto.vnpay.VNPayIPNResponse;
import secure_shop.backend.entities.Order;
import secure_shop.backend.entities.Payment;
import secure_shop.backend.enums.PaymentStatus;
import secure_shop.backend.repositories.OrderRepository;
import secure_shop.backend.repositories.PaymentRepository;
import secure_shop.backend.service.impl.VNPayServiceImpl;
import secure_shop.backend.utils.VNPayUtil;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VNPayServiceImplTest {

    @Mock
    private VNPayConfig vnPayConfig;

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private PaymentRepository paymentRepository;

    @InjectMocks
    private VNPayServiceImpl vnPayService;

    private UUID orderId;
    private Order order;

    @BeforeEach
    void setUp() {
        orderId = UUID.randomUUID();
        order = new Order();
        order.setId(orderId);
        order.setGrandTotal(BigDecimal.valueOf(100_000));

        when(vnPayConfig.getSecretKey()).thenReturn("secret");
    }

    @Test
    void processIPN_success_updatesOrderAndPayment() {
        when(orderRepository.findById(orderId)).thenReturn(Optional.of(order));
        when(paymentRepository.findByOrderId(orderId)).thenReturn(Optional.empty());
        when(paymentRepository.save(any(Payment.class))).thenAnswer(inv -> inv.getArgument(0));

        Map<String, String> params = new HashMap<>();
        params.put("vnp_TmnCode", "3K5NU1SZ");
        params.put("vnp_Amount", "10000000"); // amount * 100
        params.put("vnp_BankCode", "NCB");
        params.put("vnp_BankTranNo", "123456");
        params.put("vnp_CardType", "ATM");
        params.put("vnp_PayDate", "20250101120000");
        params.put("vnp_OrderInfo", "Thanh toan don hang - OrderID: " + orderId);
        params.put("vnp_TransactionNo", "999999");
        params.put("vnp_ResponseCode", "00");
        params.put("vnp_TransactionStatus", "00");
        params.put("vnp_TxnRef", "TXNREF123");

        // Build signature
        Map<String, String> signMap = new HashMap<>(params);
        String secureHash = VNPayUtil.hashAllFields(signMap, vnPayConfig.getSecretKey());
        params.put("vnp_SecureHash", secureHash);

        VNPayIPNResponse response = vnPayService.processIPN(new HashMap<>(params));

        assertThat(response.getRspCode()).isEqualTo("00");
        assertThat(response.getMessage()).isEqualTo("Confirm Success");

        // Verify order updated
        ArgumentCaptor<Order> orderCaptor = ArgumentCaptor.forClass(Order.class);
        verify(orderRepository, atLeastOnce()).save(orderCaptor.capture());
        Order savedOrder = orderCaptor.getValue();
        assertThat(savedOrder.getHasPaid()).isTrue();
        assertThat(savedOrder.getPaymentStatus()).isEqualTo(secure_shop.backend.enums.PaymentStatus.PAID);

        // Verify payment saved
        ArgumentCaptor<Payment> paymentCaptor = ArgumentCaptor.forClass(Payment.class);
        verify(paymentRepository).save(paymentCaptor.capture());
        Payment savedPayment = paymentCaptor.getValue();
        assertThat(savedPayment.getStatus()).isEqualTo(PaymentStatus.PAID);
        assertThat(savedPayment.getTransactionId()).isEqualTo("999999");
        assertThat(savedPayment.getPaidAt()).isNotNull();
    }

    @Test
    void processIPN_invalidSignature_returns97() {
        when(orderRepository.findById(orderId)).thenReturn(Optional.of(order));

        Map<String, String> params = new HashMap<>();
        params.put("vnp_TmnCode", "3K5NU1SZ");
        params.put("vnp_Amount", "10000000");
        params.put("vnp_OrderInfo", "Thanh toan - OrderID: " + orderId);
        params.put("vnp_ResponseCode", "00");
        params.put("vnp_TransactionStatus", "00");
        params.put("vnp_TxnRef", "TXNREF");
        params.put("vnp_SecureHash", "WRONG_HASH");

        VNPayIPNResponse response = vnPayService.processIPN(new HashMap<>(params));
        assertThat(response.getRspCode()).isEqualTo("97");
    }

    @Test
    void processIPN_amountMismatch_returns04() {
        when(orderRepository.findById(orderId)).thenReturn(Optional.of(order));
        when(paymentRepository.findByOrderId(orderId)).thenReturn(Optional.empty());

        Map<String, String> params = new HashMap<>();
        params.put("vnp_TmnCode", "3K5NU1SZ");
        params.put("vnp_Amount", "5000000"); // 50,000 VND -> mismatch
        params.put("vnp_OrderInfo", "Thanh toan - OrderID: " + orderId);
        params.put("vnp_ResponseCode", "00");
        params.put("vnp_TransactionStatus", "00");
        params.put("vnp_TxnRef", "TXNREF");

        Map<String, String> signMap = new HashMap<>(params);
        String secureHash = VNPayUtil.hashAllFields(signMap, vnPayConfig.getSecretKey());
        params.put("vnp_SecureHash", secureHash);

        VNPayIPNResponse response = vnPayService.processIPN(new HashMap<>(params));
        assertThat(response.getRspCode()).isEqualTo("04");
    }
}

