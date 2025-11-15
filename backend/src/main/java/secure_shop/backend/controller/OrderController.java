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
import secure_shop.backend.service.OrderService;

import java.util.Map;

import secure_shop.backend.service.OrderConfirmationService;
import secure_shop.backend.dto.order.request.OrderCreateRequest;


import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final OrderConfirmationService orderConfirmationService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<OrderDTO>> getAllOrders(Pageable pageable) {
        return ResponseEntity.ok(orderService.getOrdersPage(pageable));
    }

    @GetMapping("/my-orders")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<OrderDTO>> getMyOrders(@AuthenticationPrincipal CustomUserDetails userDetails) {
        UUID userId = userDetails.getUser().getId();
        return ResponseEntity.ok(orderService.getOrdersByUserId(userId));
    }

    @GetMapping("/{id}")
    @PreAuthorize("@securityService.canAccessOrder(#id, authentication)")
    public ResponseEntity<OrderDetailsDTO> getOrderById(@PathVariable UUID id) {
        return ResponseEntity.ok(orderService.getOrderDetailsById(id));
    }

     @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<OrderDTO> createOrder(
            @Valid @RequestBody OrderCreateRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        UUID userId = userDetails.getUser().getId();
        OrderDTO order = orderService.createOrder(request, userId);
        
        // ✅ Gửi email xác nhận async
        orderConfirmationService.sendOrderConfirmationEmail(order.getId());
        
        return ResponseEntity.ok(order);
    }

   /**
     * ✅ Endpoint xác nhận đơn hàng qua token từ email
     * GET /api/orders/confirm?token=xxx
     * PUBLIC - Không cần authentication
     */
    @GetMapping("/confirm")
    public ResponseEntity<Map<String, Object>> confirmOrder(@RequestParam String token) {
        try {
            boolean success = orderConfirmationService.confirmOrder(token);
            
            if (success) {
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Xác nhận đơn hàng thành công! Đơn hàng của bạn đang được xử lý."
                ));
            } else {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Link xác nhận không hợp lệ hoặc đã hết hạn."
                ));
            }
        } catch (Exception e) {
            System.err.println("❌ [CONTROLLER] Error confirming order: " + e.getMessage());
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "message", "Đã có lỗi xảy ra. Vui lòng thử lại sau."
            ));
        }
    }

    /**
     * ✅ Endpoint kiểm tra trạng thái xác nhận đơn hàng
     * GET /api/orders/{orderId}/confirmation-status
     * PUBLIC - Không cần authentication (để polling work)
     */
    @GetMapping("/{orderId}/confirmation-status")
    public ResponseEntity<Map<String, Object>> checkConfirmationStatus(@PathVariable UUID orderId) {
        try {
            boolean isConfirmed = orderConfirmationService.isOrderConfirmed(orderId);
            
            return ResponseEntity.ok(Map.of(
                "orderId", orderId.toString(),
                "isConfirmed", isConfirmed,
                "status", isConfirmed ? "CONFIRMED" : "PENDING"
            ));
        } catch (Exception e) {
            System.err.println("❌ [CONTROLLER] Error checking confirmation status: " + e.getMessage());
            return ResponseEntity.status(500).body(Map.of(
                "orderId", orderId.toString(),
                "isConfirmed", false,
                "status", "ERROR",
                "message", "Không thể kiểm tra trạng thái đơn hàng"
            ));
        }
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
}
