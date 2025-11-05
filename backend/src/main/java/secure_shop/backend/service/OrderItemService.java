package secure_shop.backend.service;

import secure_shop.backend.dto.order.OrderItemDTO;

import java.util.List;

public interface OrderItemService {
    OrderItemDTO createOrderItem(OrderItemDTO orderItemDTO);

    OrderItemDTO updateOrderItem(Long id, OrderItemDTO orderItemDTO);

    void deleteOrderItem(Long id);

    OrderItemDTO getOrderItemById(Long id);

    List<OrderItemDTO> getAllOrderItems();

    List<OrderItemDTO> getOrderItemsByOrderId(java.util.UUID orderId);
}

