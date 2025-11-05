package secure_shop.backend.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import secure_shop.backend.dto.order.OrderDTO;
import secure_shop.backend.dto.order.OrderDetailsDTO;

import java.util.List;
import java.util.UUID;

public interface OrderService {
    OrderDTO createOrder(OrderDTO orderDTO);

    OrderDTO updateOrder(UUID id, OrderDTO orderDTO);

    void deleteOrder(UUID id);

    OrderDTO getOrderById(UUID id);

    OrderDetailsDTO getOrderDetailsById(UUID id);

    List<OrderDTO> getAllOrders();

    Page<OrderDTO> getOrdersPage(Pageable pageable);

    List<OrderDTO> getOrdersByUserId(UUID userId);

    OrderDTO confirmOrder(UUID id);

    OrderDTO cancelOrder(UUID id);
}

