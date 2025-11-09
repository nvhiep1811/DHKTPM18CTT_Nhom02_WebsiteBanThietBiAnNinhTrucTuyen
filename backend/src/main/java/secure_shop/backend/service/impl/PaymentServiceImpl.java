package secure_shop.backend.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import secure_shop.backend.dto.order.PaymentDTO;
import secure_shop.backend.entities.Payment;
import secure_shop.backend.enums.PaymentStatus;
import secure_shop.backend.exception.ResourceNotFoundException;
import secure_shop.backend.mapper.PaymentMapper;
import secure_shop.backend.repositories.PaymentRepository;
import secure_shop.backend.service.PaymentService;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final PaymentMapper paymentMapper;

    @Override
    @Transactional
    public PaymentDTO createPayment(PaymentDTO paymentDTO) {
        Payment payment = paymentMapper.toEntity(paymentDTO);
        Payment savedPayment = paymentRepository.save(payment);
        return paymentMapper.toDTO(savedPayment);
    }

    @Override
    @Transactional
    public PaymentDTO updatePayment(UUID id, PaymentDTO paymentDTO) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", id));

        paymentMapper.updateEntityFromDTO(paymentDTO, payment);
        Payment updatedPayment = paymentRepository.save(payment);
        return paymentMapper.toDTO(updatedPayment);
    }

    @Override
    @Transactional
    public void deletePayment(UUID id) {
        if (!paymentRepository.existsById(id)) {
            throw new ResourceNotFoundException("Payment", id);
        }
        paymentRepository.deleteById(id);
    }

    @Override
    public PaymentDTO getPaymentById(UUID id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", id));
        return paymentMapper.toDTO(payment);
    }

    @Override
    public List<PaymentDTO> getAllPayments() {
        return paymentRepository.findAll().stream()
                .map(paymentMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public Page<PaymentDTO> getPaymentsPage(Pageable pageable) {
        return paymentRepository.findAll(pageable)
                .map(paymentMapper::toDTO);
    }

    @Override
    public PaymentDTO getPaymentByOrderId(UUID orderId) {
        Payment payment = paymentRepository.findAll().stream()
                .filter(p -> p.getOrder() != null && p.getOrder().getId().equals(orderId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Payment for Order", orderId));
        return paymentMapper.toDTO(payment);
    }

    @Override
    public PaymentDTO markAsPaid(UUID id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", id));

        payment.setStatus(PaymentStatus.PAID);
        payment.setPaidAt(Instant.now());

        Payment updatedPayment = paymentRepository.save(payment);
        return paymentMapper.toDTO(updatedPayment);
    }
}

