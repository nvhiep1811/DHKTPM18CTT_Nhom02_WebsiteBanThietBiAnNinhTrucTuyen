package secure_shop.backend.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import secure_shop.backend.dto.order.OrderDTO;
import secure_shop.backend.dto.order.OrderDetailsDTO;
import secure_shop.backend.dto.order.request.OrderCreateRequest;
import secure_shop.backend.dto.order.request.OrderItemRequest;
import secure_shop.backend.entities.*;
import secure_shop.backend.enums.OrderStatus;
import secure_shop.backend.enums.PaymentMethod;
import secure_shop.backend.enums.PaymentStatus;
import secure_shop.backend.exception.BusinessRuleViolationException;
import secure_shop.backend.exception.ResourceNotFoundException;
import secure_shop.backend.mapper.OrderMapper;
import secure_shop.backend.repositories.*;
import secure_shop.backend.service.OrderService;
import secure_shop.backend.service.EmailService;
import secure_shop.backend.service.InventoryService;

import java.math.RoundingMode;
import java.time.Instant;
import java.util.List;

import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;
import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
@Transactional
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final OrderMapper orderMapper;
    private final ProductRepository productRepository;
    private final PaymentRepository paymentRepository;
    private final InventoryRepository inventoryRepository;
    private final InventoryService inventoryService;
    private final EmailService emailService;
    private final UserRepository userRepository;
    private final DiscountRepository discountRepository;

    @Override
    public OrderDTO createOrder(OrderCreateRequest request, UUID userId) {
        if (request == null || request.getItems() == null || request.getItems().isEmpty()) {
            throw new BusinessRuleViolationException("Order must contain at least one item");
        }

        // Reserve inventory first for all items. Reservations participate in the same transaction
        for (OrderItemRequest itemReq : request.getItems()) {
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product", itemReq.getProductId()));

            var optInv = inventoryRepository.findByProductId(product.getId());
            if (optInv.isEmpty()) {
                throw new BusinessRuleViolationException("Không tìm thấy tồn kho cho sản phẩm: " + product.getId());
            }
            var inv = optInv.get();

            // reserve - will participate in the outer transaction; if any reserve fails, the exception will rollback all changes
            inventoryService.reserveStock(inv.getId(), itemReq.getQuantity());
        }

        // Fetch full user entity (avoid transient with only id so email sending works)
        User user = null;
        UUID effectiveUserId = userId != null ? userId : request.getUserId();
        if (effectiveUserId != null) {
            user = userRepository.findById(effectiveUserId)
                    .orElseThrow(() -> new ResourceNotFoundException("User", effectiveUserId));
        }
        Discount discount = null;
        if (request.getDiscountCode() != null) {
            discount = discountRepository.findByCode(request.getDiscountCode())
                    .orElseThrow(() -> new ResourceNotFoundException("Discount", request.getDiscountCode()));
        }
        // Build order entity (single creation)
        Order order = Order.builder()
            .shippingFee(request.getShippingFee())
            .shippingAddress(request.getShippingAddress())
            .user(user)
            .discount(discount)
            .build();

       // create order items and attach to order
        for (OrderItemRequest itemReq : request.getItems()) {
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product", itemReq.getProductId()));

            BigDecimal unitPrice = product.getPrice();
            BigDecimal lineTotal = unitPrice.multiply(BigDecimal.valueOf(itemReq.getQuantity()));

            OrderItem item = OrderItem.builder()
                    .product(product)
                    .quantity(itemReq.getQuantity())
                    .unitPrice(unitPrice)
                    .lineTotal(lineTotal) // Tính ngay
                    .order(order)
                    .build();
            order.getOrderItems().add(item);
        }

        // --- Tính subtotal tại server (an toàn) ---
        BigDecimal subTotal = order.getOrderItems().stream()
                .map(OrderItem::getLineTotal)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, RoundingMode.HALF_UP);

        // --- Tính discountTotal bằng helper ---
        BigDecimal shippingFee = order.getShippingFee() != null ? order.getShippingFee() : BigDecimal.ZERO;
        BigDecimal discountTotal = BigDecimal.ZERO;
        if (discount != null) {
            discountTotal = calculateDiscountAmount(discount, subTotal, shippingFee, user);
        }

        order.setSubTotal(subTotal);
        order.setDiscountTotal(discountTotal);
        order.setShippingFee(shippingFee);

        // Persist order (totals will be calculated by @PrePersist)
        Order savedOrder = orderRepository.save(order);

        if (discount != null) {
            discount.setUsed(discount.getUsed() == null ? 1 : discount.getUsed() + 1);
            discountRepository.save(discount);
        }

        if (request.getPaymentMethod() == null ||
                request.getPaymentMethod() == PaymentMethod.COD) {
            try {
                emailService.sendOrderConfirmationEmail(savedOrder);
            } catch (Exception ex) {
            }
        }
        return orderMapper.toDTO(savedOrder);
    }

    @Override
    public OrderDTO updateOrder(UUID id, OrderDTO orderDTO) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", id));

        orderMapper.updateEntityFromDTO(orderDTO, order);
        Order updatedOrder = orderRepository.save(order);
        return orderMapper.toDTO(updatedOrder);
    }

    @Override
    public void deleteOrder(UUID id) {
        if (!orderRepository.existsById(id)) {
            throw new ResourceNotFoundException("Order", id);
        }
        orderRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderDTO getOrderById(UUID id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", id));
        return orderMapper.toDTO(order);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderDetailsDTO getOrderDetailsById(UUID id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", id));
        return orderMapper.toDetailsDTO(order);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderDTO> getAllOrders() {
        return orderRepository.findAll().stream()
                .map(orderMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OrderDTO> getOrdersPage(Pageable pageable) {
        return orderRepository.findAllOrdersSortedByCreatedAtDesc(pageable)
                .map(orderMapper::toDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderDTO> getOrdersByUserId(UUID userId) {
        return orderRepository.findByUserId(userId).stream()
                .sorted((o1, o2) -> o2.getCreatedAt().compareTo(o1.getCreatedAt()))
                .map(orderMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public OrderDTO confirmOrder(UUID id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", id));

        // Validate that order can be confirmed
        if (order.getStatus() == OrderStatus.CANCELLED) {
            throw new BusinessRuleViolationException("Cannot confirm cancelled order");
        }
        if (order.getStatus() == OrderStatus.DELIVERED) {
            throw new BusinessRuleViolationException("Order already delivered");
        }
        if (order.getStatus() != OrderStatus.PENDING) {
            throw new BusinessRuleViolationException("Only pending orders can be confirmed");
        }

        // Consume reserved stock atomically for each item (decrease onHand and reserved)
        if (order.getOrderItems() != null) {
            for (OrderItem item : order.getOrderItems()) {
                Product product = item.getProduct();
                if (product == null || product.getId() == null) continue;

                var optInv = inventoryRepository.findByProductId(product.getId());
                if (optInv.isEmpty()) {
                    throw new BusinessRuleViolationException("Không tìm thấy tồn kho cho sản phẩm: " + product.getId());
                }
                var inv = optInv.get();

                try {
                    inventoryService.consumeReservedStock(inv.getId(), item.getQuantity());
                } catch (RuntimeException ex) {
                    throw new BusinessRuleViolationException("Không thể cập nhật tồn kho khi xác nhận đơn hàng");
                }
            }
        }

        order.setStatus(OrderStatus.WAITING_FOR_DELIVERY);
        order.setConfirmedAt(Instant.now());

        Order updatedOrder = orderRepository.save(order);
        return orderMapper.toDTO(updatedOrder);
    }

    @Override
    public OrderDTO cancelOrder(UUID id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", id));

        Payment payment = null;
        try {
            payment = paymentRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Payment", id));
        } catch (Exception ignored) {
        }

        // Validate that order can be cancelled
        if (order.getStatus() == OrderStatus.CANCELLED) {
            throw new BusinessRuleViolationException("Order already cancelled");
        }
        if (order.getStatus() == OrderStatus.DELIVERED) {
            throw new BusinessRuleViolationException("Cannot cancel delivered order");
        }
        if (order.getStatus() == OrderStatus.WAITING_FOR_DELIVERY) {
            throw new BusinessRuleViolationException("Cannot cancel order that is already shipping");
        }

        // Release reserved stock for each item
        if (order.getOrderItems() != null) {
            for (OrderItem item : order.getOrderItems()) {
                Product product = item.getProduct();
                if (product == null || product.getId() == null) continue;

                var optInv = inventoryRepository.findByProductId(product.getId());
                if (optInv.isPresent()) {
                    var inv = optInv.get();
                    try {
                        inventoryService.releaseStock(inv.getId(), item.getQuantity());
                    } catch (RuntimeException ex) {
                        // log and continue
                        throw new BusinessRuleViolationException("Không thể hoàn lại giữ chỗ tồn kho cho sản phẩm: " + product.getId());
                    }
                }
            }
        }

        order.setStatus(OrderStatus.CANCELLED);
        order.setCancelledAt(Instant.now());

        // If order was already paid, mark payment as refunded
        if (order.getPaymentStatus() == PaymentStatus.PAID) {
            order.setPaymentStatus(PaymentStatus.REFUNDED);

            if (payment != null) {
                payment.setStatus(PaymentStatus.REFUNDED);
                paymentRepository.save(payment);
            }
        }

        Order updatedOrder = orderRepository.save(order);
        return orderMapper.toDTO(updatedOrder);
    }

    // helper trong OrderService (private)
    private BigDecimal calculateDiscountAmount(Discount discount, BigDecimal subTotal, BigDecimal shippingFee, User user) {
        if (discount == null) return BigDecimal.ZERO;

        // validate active / date
        if (Boolean.FALSE.equals(discount.getActive())) {
            throw new BusinessRuleViolationException("Mã giảm giá không còn hoạt động");
        }
        Instant now = Instant.now();
        if (discount.getStartAt() != null && discount.getStartAt().isAfter(now)) {
            throw new BusinessRuleViolationException("Mã giảm giá chưa bắt đầu");
        }
        if (discount.getEndAt() != null && discount.getEndAt().isBefore(now)) {
            throw new BusinessRuleViolationException("Mã giảm giá đã hết hạn");
        }

        // min order
        if (discount.getMinOrderValue() != null && subTotal.compareTo(discount.getMinOrderValue()) < 0) {
            throw new BusinessRuleViolationException("Đơn hàng chưa đạt giá trị tối thiểu để áp dụng mã");
        }

        // usage limits (simple checks - concurrent updates need DB-side handling)
        if (discount.getMaxUsage() != null && discount.getUsed() != null && discount.getUsed().compareTo(discount.getMaxUsage()) >= 0) {
            throw new BusinessRuleViolationException("Mã giảm giá đã hết lượt sử dụng");
        }

        if (discount.getPerUserLimit() != null && user != null) {
            // bạn cần có phương pháp lấy số lượt user đã dùng (ví dụ: discountUsageRepository.countByDiscountAndUser)
            Integer usedByUser = orderRepository.countByDiscountIdAndUserId(discount.getId(), user.getId());
            if (usedByUser >= discount.getPerUserLimit()) {
                throw new BusinessRuleViolationException("Bạn đã dùng hết lượt cho mã này");
            }
        }

        BigDecimal discountAmount = BigDecimal.ZERO;
        String type = String.valueOf(discount.getDiscountType()); // hoặc enum

        if ("PERCENT".equalsIgnoreCase(type)) {
            BigDecimal percent = discount.getDiscountValue() == null ? BigDecimal.ZERO : discount.getDiscountValue();
            discountAmount = subTotal.multiply(percent).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            // optional: cap discount <= subTotal
            if (discountAmount.compareTo(subTotal) > 0) discountAmount = subTotal;
        } else if ("FIXED_AMOUNT".equalsIgnoreCase(type)) {
            discountAmount = discount.getDiscountValue() == null ? BigDecimal.ZERO : discount.getDiscountValue();
            if (discountAmount.compareTo(subTotal) > 0) discountAmount = subTotal;
        } else if ("FREE_SHIP".equalsIgnoreCase(type)) {
            discountAmount = shippingFee == null ? BigDecimal.ZERO : shippingFee;
        }

        // scale 2
        return discountAmount.setScale(2, RoundingMode.HALF_UP);
    }

    @Override
    public OrderDTO changeOrderStatus(UUID id, String status) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", id));

        // Validate status
        OrderStatus newStatus;
        try {
            newStatus = OrderStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BusinessRuleViolationException("Invalid order status: " + status);
        }

        // Validate that order can be changed
        if (order.getStatus() == OrderStatus.CANCELLED) {
            throw new BusinessRuleViolationException("Cannot change status of cancelled order");
        }

        // Check payment method
        Payment payment = order.getPayment();
        boolean isCOD = payment != null && payment.getMethod() == PaymentMethod.COD;

        // Update status
        order.setStatus(newStatus);

        // For COD payment: if status is DELIVERED, update payment-related fields
        if (isCOD && newStatus == OrderStatus.DELIVERED) {
            order.setHasPaid(true);
            order.setPaymentStatus(secure_shop.backend.enums.PaymentStatus.PAID);
            if (order.getConfirmedAt() == null) {
                order.setConfirmedAt(Instant.now());
            }
            // Also update payment entity status
            payment.setStatus(secure_shop.backend.enums.PaymentStatus.PAID);
            payment.setPaidAt(Instant.now());
        }

        Order updatedOrder = orderRepository.save(order);
        return orderMapper.toDTO(updatedOrder);
    }

    @Override
    public Integer getTotalOrdersCount() {
        return orderRepository.countOrdersByCreatedAtIsNotNull();
    }
}
