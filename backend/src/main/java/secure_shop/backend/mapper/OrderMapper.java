package secure_shop.backend.mapper;

import org.springframework.stereotype.Component;
import secure_shop.backend.dto.order.OrderDTO;
import secure_shop.backend.dto.order.OrderDetailsDTO;
import secure_shop.backend.dto.order.OrderSummaryDTO;
import secure_shop.backend.entities.Discount;
import secure_shop.backend.entities.Order;
import secure_shop.backend.entities.User;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class OrderMapper {

    private final UserMapper userMapper;
    private final DiscountMapper discountMapper;
    private final OrderItemMapper orderItemMapper;
    private final PaymentMapper paymentMapper;
    private final ShipmentMapper shipmentMapper;

    public OrderMapper(UserMapper userMapper,
                      DiscountMapper discountMapper,
                      OrderItemMapper orderItemMapper,
                      PaymentMapper paymentMapper,
                      ShipmentMapper shipmentMapper) {
        this.userMapper = userMapper;
        this.discountMapper = discountMapper;
        this.orderItemMapper = orderItemMapper;
        this.paymentMapper = paymentMapper;
        this.shipmentMapper = shipmentMapper;
    }

    public OrderSummaryDTO toSummaryDTO(Order order) {
        if (order == null) return null;

        return OrderSummaryDTO.builder()
                .id(order.getId())
                .status(order.getStatus())
                .paymentStatus(order.getPaymentStatus())
                .subTotal(order.getSubTotal())
                .discountTotal(order.getDiscountTotal())
                .shippingFee(order.getShippingFee())
                .grandTotal(order.getGrandTotal())
                .hasPaid(order.getHasPaid())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .confirmedAt(order.getConfirmedAt())
                .cancelledAt(order.getCancelledAt())
                .shippingAddress(order.getShippingAddress())
                .discount(order.getDiscount() != null ? discountMapper.toDTO(order.getDiscount()) : null)
                .user(order.getUser() != null ? userMapper.toSummaryDTO(order.getUser()) : null)
                // orderItems intentionally excluded for performance
                .build();
    }

    public OrderDTO toDTO(Order order) {
        if (order == null) return null;

        return OrderDTO.builder()
                .id(order.getId())
                .status(order.getStatus())
                .paymentStatus(order.getPaymentStatus())
                .subTotal(order.getSubTotal())
                .discountTotal(order.getDiscountTotal())
                .shippingFee(order.getShippingFee())
                .grandTotal(order.getGrandTotal())
                .hasPaid(order.getHasPaid())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .confirmedAt(order.getConfirmedAt())
                .cancelledAt(order.getCancelledAt())
                .shippingAddress(order.getShippingAddress())
                .discount(order.getDiscount() != null ? discountMapper.toDTO(order.getDiscount()) : null)
                .user(order.getUser() != null ? userMapper.toSummaryDTO(order.getUser()) : null)
                .orderItems(order.getOrderItems() != null ?
                        order.getOrderItems().stream()
                                .map(orderItemMapper::toDTO)
                                .collect(Collectors.toSet()) : null) // Add this line
                .build();
    }

    public OrderDetailsDTO toDetailsDTO(Order order) {
        if (order == null) return null;

        return OrderDetailsDTO.builder()
                .id(order.getId())
                .status(order.getStatus())
                .paymentStatus(order.getPaymentStatus())
                .subTotal(order.getSubTotal())
                .discountTotal(order.getDiscountTotal())
                .shippingFee(order.getShippingFee())
                .grandTotal(order.getGrandTotal())
                .hasPaid(order.getHasPaid())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .confirmedAt(order.getConfirmedAt())
                .cancelledAt(order.getCancelledAt())
                .shippingAddress(order.getShippingAddress())
                .discount(order.getDiscount() != null ? discountMapper.toDTO(order.getDiscount()) : null)
                .user(order.getUser() != null ? userMapper.toSummaryDTO(order.getUser()) : null)
                .orderItems(order.getOrderItems() != null ?
                    order.getOrderItems().stream()
                        .map(orderItemMapper::toDTO)
                        .collect(Collectors.toSet()) : null)
                .payment(order.getPayment() != null ? paymentMapper.toDTO(order.getPayment()) : null)
                .build();
    }

    public Order toEntity(OrderDTO dto) {
        if (dto == null) return null;

        Order order = Order.builder()
                .status(dto.getStatus())
                .paymentStatus(dto.getPaymentStatus())
                .subTotal(dto.getSubTotal())
                .discountTotal(dto.getDiscountTotal())
                .shippingFee(dto.getShippingFee())
                .grandTotal(dto.getGrandTotal())
                .hasPaid(dto.getHasPaid())
                .confirmedAt(dto.getConfirmedAt())
                .cancelledAt(dto.getCancelledAt())
                .shippingAddress(dto.getShippingAddress())
                .build();

        order.setId(dto.getId());

        if (dto.getUser() != null && dto.getUser().getId() != null) {
            User user = new User();
            user.setId(dto.getUser().getId());
            order.setUser(user);
        }

        if (dto.getDiscount() != null && dto.getDiscount().getId() != null) {
            Discount discount = new Discount();
            discount.setId(dto.getDiscount().getId());
            order.setDiscount(discount);
        }

        return order;
    }

    public List<OrderSummaryDTO> toSummaryDTOList(List<Order> orders) {
        if (orders == null) return List.of();
        return orders.stream()
                .map(this::toSummaryDTO)
                .collect(Collectors.toList());
    }

    public List<OrderDTO> toDTOList(List<Order> orders) {
        if (orders == null) return List.of();
        return orders.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<OrderDetailsDTO> toDetailsDTOList(List<Order> orders) {
        if (orders == null) return List.of();
        return orders.stream()
                .map(this::toDetailsDTO)
                .collect(Collectors.toList());
    }

    public void updateEntityFromDTO(OrderDTO dto, Order entity) {
        if (dto == null || entity == null) return;

        if (dto.getStatus() != null) entity.setStatus(dto.getStatus());
        if (dto.getPaymentStatus() != null) entity.setPaymentStatus(dto.getPaymentStatus());
        if (dto.getSubTotal() != null) entity.setSubTotal(dto.getSubTotal());
        if (dto.getDiscountTotal() != null) entity.setDiscountTotal(dto.getDiscountTotal());
        if (dto.getShippingFee() != null) entity.setShippingFee(dto.getShippingFee());
        if (dto.getGrandTotal() != null) entity.setGrandTotal(dto.getGrandTotal());
        if (dto.getHasPaid() != null) entity.setHasPaid(dto.getHasPaid());
        if (dto.getConfirmedAt() != null) entity.setConfirmedAt(dto.getConfirmedAt());
        if (dto.getCancelledAt() != null) entity.setCancelledAt(dto.getCancelledAt());
        if (dto.getShippingAddress() != null) entity.setShippingAddress(dto.getShippingAddress());
    }
}

