package secure_shop.backend.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import secure_shop.backend.dto.order.PaymentDTO;

import java.util.List;
import java.util.UUID;

public interface PaymentService {
    PaymentDTO createPayment(PaymentDTO paymentDTO);

    PaymentDTO updatePayment(UUID id, PaymentDTO paymentDTO);

    void deletePayment(UUID id);

    PaymentDTO getPaymentById(UUID id);

    List<PaymentDTO> getAllPayments();

    Page<PaymentDTO> getPaymentsPage(Pageable pageable);

    PaymentDTO getPaymentByOrderId(UUID orderId);

    PaymentDTO markAsPaid(UUID id);
}

