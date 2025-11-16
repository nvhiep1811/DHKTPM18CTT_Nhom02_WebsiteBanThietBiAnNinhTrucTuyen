package secure_shop.backend.service;

import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import secure_shop.backend.config.VNPayConfig;
import secure_shop.backend.dto.vnpay.VNPayPaymentRequest;
import secure_shop.backend.dto.vnpay.VNPayPaymentResponse;
import secure_shop.backend.entities.Order;
import secure_shop.backend.entities.User;
import secure_shop.backend.enums.PaymentStatus;
import secure_shop.backend.repositories.OrderRepository;
import secure_shop.backend.repositories.PaymentRepository;
import secure_shop.backend.service.impl.VNPayServiceImpl;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class VNPayServiceOwnershipTest {

    @Mock
    VNPayConfig vnPayConfig;
    @Mock
    OrderRepository orderRepository;
    @Mock
    PaymentRepository paymentRepository;
    @Mock
    HttpServletRequest httpServletRequest;

    @InjectMocks
    VNPayServiceImpl vnPayServiceImpl;

    UUID ownerId;
    Order order;

    @BeforeEach
    void setup() {
        ownerId = UUID.randomUUID();
        User user = new User();
        user.setId(ownerId);
        order = new Order();
        order.setId(UUID.randomUUID());
        order.setUser(user);
        order.setGrandTotal(BigDecimal.valueOf(150_000));
        order.setPaymentStatus(PaymentStatus.UNPAID);
        order.setHasPaid(false);

        when(vnPayConfig.getVersion()).thenReturn("2.1.0");
        when(vnPayConfig.getCommand()).thenReturn("pay");
        when(vnPayConfig.getTmnCode()).thenReturn("TESTCODE");
        when(vnPayConfig.getReturnUrl()).thenReturn("http://localhost/return");
        when(vnPayConfig.getSecretKey()).thenReturn("secret");
        when(vnPayConfig.getPaymentUrl()).thenReturn("https://sandbox.vnpayment.vn/paymentv2/vpcpay.html");
        when(httpServletRequest.getRemoteAddr()).thenReturn("127.0.0.1");
    }

    @Test
    void createPaymentUrl_success_whenOwnerAndNotPaid() {
        when(orderRepository.findById(order.getId())).thenReturn(Optional.of(order));
        VNPayPaymentRequest req = VNPayPaymentRequest.builder()
                .orderId(order.getId())
                .amount(150_000L)
                .build();

        VNPayPaymentResponse resp = vnPayServiceImpl.createPaymentUrl(req, httpServletRequest, ownerId);
        assertThat(resp.getCode()).isEqualTo("00");
        assertThat(resp.getPaymentUrl()).contains("vnp_Amount");
    }

    @Test
    void createPaymentUrl_forbidden_whenNotOwner() {
        when(orderRepository.findById(order.getId())).thenReturn(Optional.of(order));
        VNPayPaymentRequest req = VNPayPaymentRequest.builder()
                .orderId(order.getId())
                .amount(150_000L)
                .build();
        UUID otherUser = UUID.randomUUID();

        VNPayPaymentResponse resp = vnPayServiceImpl.createPaymentUrl(req, httpServletRequest, otherUser);
        assertThat(resp.getCode()).isEqualTo("403");
        assertThat(resp.getPaymentUrl()).isNull();
    }

    @Test
    void createPaymentUrl_conflict_whenAlreadyPaid() {
        order.setHasPaid(true);
        order.setPaymentStatus(PaymentStatus.PAID);
        when(orderRepository.findById(order.getId())).thenReturn(Optional.of(order));
        VNPayPaymentRequest req = VNPayPaymentRequest.builder()
                .orderId(order.getId())
                .amount(150_000L)
                .build();

        VNPayPaymentResponse resp = vnPayServiceImpl.createPaymentUrl(req, httpServletRequest, ownerId);
        assertThat(resp.getCode()).isEqualTo("409");
        assertThat(resp.getPaymentUrl()).isNull();
    }
}

