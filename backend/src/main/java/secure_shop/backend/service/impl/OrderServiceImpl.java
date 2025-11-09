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
import secure_shop.backend.entities.Order;
import secure_shop.backend.entities.OrderItem;
import secure_shop.backend.entities.Product;
import secure_shop.backend.entities.User;
import secure_shop.backend.enums.OrderStatus;
import secure_shop.backend.exception.BusinessRuleViolationException;
import secure_shop.backend.exception.ResourceNotFoundException;
import secure_shop.backend.mapper.OrderMapper;
import secure_shop.backend.repositories.OrderRepository;
import secure_shop.backend.repositories.ProductRepository;
import secure_shop.backend.service.OrderService;
import secure_shop.backend.repositories.InventoryRepository;
import secure_shop.backend.service.InventoryService;

import java.time.Instant;
import java.util.List;
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
    private final InventoryRepository inventoryRepository;
    private final InventoryService inventoryService;

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

        // Build order entity
        Order order = Order.builder()
                .shippingFee(request.getShippingFee())
                .shippingAddress(request.getShippingAddress())
                .build();

        // set user (only id) if provided
        if (userId != null) {
            User user = new User();
            user.setId(userId);
            order.setUser(user);
        } else if (request.getUserId() != null) {
            User user = new User();
            user.setId(request.getUserId());
            order.setUser(user);
        }

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

        // Persist order (totals will be calculated by @PrePersist)
        Order savedOrder = orderRepository.save(order);
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
        return orderRepository.findAll(pageable)
                .map(orderMapper::toDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderDTO> getOrdersByUserId(UUID userId) {
        return orderRepository.findByUserId(userId).stream()
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

        Order updatedOrder = orderRepository.save(order);
        return orderMapper.toDTO(updatedOrder);
    }
}
