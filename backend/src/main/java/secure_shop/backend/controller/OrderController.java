package secure_shop.backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import secure_shop.backend.config.security.CustomUserDetails;
import secure_shop.backend.dto.order.OrderDTO;
import secure_shop.backend.dto.order.OrderDetailsDTO;
import secure_shop.backend.dto.order.OrderItemDTO;
import secure_shop.backend.dto.order.OrderSummaryDTO;
import secure_shop.backend.dto.order.request.OrderCreateRequest;
import secure_shop.backend.dto.order.request.OrderStatusChangeRequest;
import secure_shop.backend.service.OrderService;
import secure_shop.backend.service.OrderItemService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final OrderItemService orderItemService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<OrderSummaryDTO>> getAllOrders(Pageable pageable) {
        return ResponseEntity.ok(orderService.getOrdersPage(pageable));
    }

    @GetMapping("/my-orders")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<OrderSummaryDTO>> getMyOrders(@AuthenticationPrincipal CustomUserDetails userDetails) {
        UUID userId = userDetails.getUser().getId();
        return ResponseEntity.ok(orderService.getOrdersByUserId(userId));
    }

    @GetMapping("/{id}")
    @PreAuthorize("@securityService.canAccessOrder(#id, authentication)")
    public ResponseEntity<OrderDetailsDTO> getOrderById(@PathVariable UUID id) {
        return ResponseEntity.ok(orderService.getOrderDetailsById(id));
    }

    @GetMapping("/{orderId}/items")
    @PreAuthorize("@securityService.canAccessOrder(#orderId, authentication)")
    public ResponseEntity<List<OrderItemDTO>> getOrderItems(@PathVariable UUID orderId) {
        return ResponseEntity.ok(orderItemService.getOrderItemsByOrderId(orderId));
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<OrderDTO> createOrder(@Valid @RequestBody OrderCreateRequest request,
                                                @AuthenticationPrincipal CustomUserDetails userDetails) {
        UUID userId = userDetails.getUser().getId();
        return ResponseEntity.ok(orderService.createOrder(request, userId));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<OrderDTO> updateOrder(@PathVariable UUID id, @Valid @RequestBody OrderDTO dto) {
        return ResponseEntity.ok(orderService.updateOrder(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteOrder(@PathVariable UUID id) {
        orderService.deleteOrder(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/confirm/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<OrderDTO> confirmOrder(@PathVariable UUID id) {
        return ResponseEntity.ok(orderService.confirmOrder(id));
    }

    @PatchMapping("/cancel/{id}")
    @PreAuthorize("@securityService.canAccessOrder(#id, authentication)")
    public ResponseEntity<OrderDTO> cancelOrder(@PathVariable UUID id) {
        return ResponseEntity.ok(orderService.cancelOrder(id));
    }

    @GetMapping("/count")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Integer> getTotalOrdersCount() {
        Integer totalCount = orderService.getTotalOrdersCount();
        return ResponseEntity.ok(totalCount);
    }

    @PatchMapping("/status/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<OrderDTO> changeOrderStatus(
            @PathVariable UUID id,
            @Valid @RequestBody OrderStatusChangeRequest request) {
        return ResponseEntity.ok(orderService.changeOrderStatus(id, request.getStatus()));
    }
}
