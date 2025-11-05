package secure_shop.backend.mapper;

import org.springframework.stereotype.Component;
import secure_shop.backend.dto.order.PaymentDTO;
import secure_shop.backend.entities.Order;
import secure_shop.backend.entities.Payment;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class PaymentMapper {

    public PaymentDTO toDTO(Payment payment) {
        if (payment == null) return null;

        return PaymentDTO.builder()
                .id(payment.getId())
                .createdAt(payment.getCreatedAt())
                .updatedAt(payment.getUpdatedAt())
                .method(payment.getMethod())
                .provider(payment.getProvider())
                .status(payment.getStatus())
                .amount(payment.getAmount())
                .transactionId(payment.getTransactionId())
                .paidAt(payment.getPaidAt())
                .gatewayResponse(payment.getGatewayResponse())
                .orderId(payment.getOrder() != null ? payment.getOrder().getId() : null)
                .build();
    }

    public Payment toEntity(PaymentDTO dto) {
        if (dto == null) return null;

        Payment payment = Payment.builder()
                .method(dto.getMethod())
                .provider(dto.getProvider())
                .status(dto.getStatus())
                .amount(dto.getAmount())
                .transactionId(dto.getTransactionId())
                .paidAt(dto.getPaidAt())
                .gatewayResponse(dto.getGatewayResponse())
                .build();

        payment.setId(dto.getId());

        if (dto.getOrderId() != null) {
            Order order = new Order();
            order.setId(dto.getOrderId());
            payment.setOrder(order);
        }

        return payment;
    }

    public List<PaymentDTO> toDTOList(List<Payment> payments) {
        if (payments == null) return List.of();
        return payments.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public void updateEntityFromDTO(PaymentDTO dto, Payment entity) {
        if (dto == null || entity == null) return;

        if (dto.getMethod() != null) entity.setMethod(dto.getMethod());
        if (dto.getProvider() != null) entity.setProvider(dto.getProvider());
        if (dto.getStatus() != null) entity.setStatus(dto.getStatus());
        if (dto.getAmount() != null) entity.setAmount(dto.getAmount());
        if (dto.getTransactionId() != null) entity.setTransactionId(dto.getTransactionId());
        if (dto.getPaidAt() != null) entity.setPaidAt(dto.getPaidAt());
        if (dto.getGatewayResponse() != null) entity.setGatewayResponse(dto.getGatewayResponse());
    }
}

