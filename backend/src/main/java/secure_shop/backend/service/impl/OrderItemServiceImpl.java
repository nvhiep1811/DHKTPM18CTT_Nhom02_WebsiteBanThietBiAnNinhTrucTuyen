package secure_shop.backend.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import secure_shop.backend.dto.order.OrderItemDTO;
import secure_shop.backend.entities.OrderItem;
import secure_shop.backend.mapper.OrderItemMapper;
import secure_shop.backend.repositories.OrderItemRepository;
import secure_shop.backend.service.OrderItemService;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OrderItemServiceImpl implements OrderItemService {

    private final OrderItemRepository orderItemRepository;
    private final OrderItemMapper orderItemMapper;

    @Override
    @Transactional
    public OrderItemDTO createOrderItem(OrderItemDTO orderItemDTO) {
        OrderItem orderItem = orderItemMapper.toEntity(orderItemDTO);
        OrderItem savedOrderItem = orderItemRepository.save(orderItem);
        return orderItemMapper.toDTO(savedOrderItem);
    }

    @Override
    @Transactional
    public OrderItemDTO updateOrderItem(Long id, OrderItemDTO orderItemDTO) {
        OrderItem orderItem = orderItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("OrderItem not found with id: " + id));

        orderItemMapper.updateEntityFromDTO(orderItemDTO, orderItem);
        OrderItem updatedOrderItem = orderItemRepository.save(orderItem);
        return orderItemMapper.toDTO(updatedOrderItem);
    }

    @Override
    @Transactional
    public void deleteOrderItem(Long id) {
        if (!orderItemRepository.existsById(id)) {
            throw new RuntimeException("OrderItem not found with id: " + id);
        }
        orderItemRepository.deleteById(id);
    }

    @Override
    public OrderItemDTO getOrderItemById(Long id) {
        OrderItem orderItem = orderItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("OrderItem not found with id: " + id));
        return orderItemMapper.toDTO(orderItem);
    }

    @Override
    public List<OrderItemDTO> getAllOrderItems() {
        return orderItemRepository.findAll().stream()
                .map(orderItemMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<OrderItemDTO> getOrderItemsByOrderId(UUID orderId) {
        return orderItemRepository.findAll().stream()
                .filter(item -> item.getOrder() != null && item.getOrder().getId().equals(orderId))
                .map(orderItemMapper::toDTO)
                .collect(Collectors.toList());
    }
}

