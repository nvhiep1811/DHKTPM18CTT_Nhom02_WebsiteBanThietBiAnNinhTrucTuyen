package secure_shop.backend.security;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import secure_shop.backend.config.security.CustomUserDetails;
import secure_shop.backend.dto.order.OrderDetailsDTO;
import secure_shop.backend.entities.WarrantyRequest;
import secure_shop.backend.repositories.OrderItemRepository;
import secure_shop.backend.repositories.WarrantyRequestRepository;
import secure_shop.backend.repositories.OrderRepository;
import secure_shop.backend.service.OrderService;
import secure_shop.backend.service.ReviewService;

import java.util.Optional;
import java.util.UUID;

@Service("securityService")
@RequiredArgsConstructor
public class SecurityExpressionService {

    private final OrderService orderService;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ReviewService reviewService;
    private final WarrantyRequestRepository warrantyRequestRepository;

    /**
     * Kiểm tra xem user có quyền truy cập order này không
     * @param orderId ID của order
     * @param authentication Thông tin authentication
     * @return true nếu user là admin hoặc owner của order
     */
    public boolean canAccessOrder(UUID orderId, Authentication authentication) {
        if (!isAuthenticated(authentication)) return false;
        if (isAdmin(authentication)) return true;

        Optional<UUID> currentUserId = getCurrentUserId(authentication);
        if (currentUserId.isEmpty()) return false;

        return orderRepository.findById(orderId)
                .map(order -> order.getUser() != null && order.getUser().getId() != null
                        && currentUserId.get().equals(order.getUser().getId()))
                .orElse(false);
    }

    /**
     * Kiểm tra xem user có quyền truy cập review này không
     * @param orderItemId ID của order item
     * @param authentication Thông tin authentication
     * @return true nếu user là admin hoặc owner của order chứa order item
     */
    public boolean canAccessOrderItem(Long orderItemId, Authentication authentication) {
        if (!isAuthenticated(authentication)) return false;

        Optional<CustomUserDetails> maybeUserDetails = getCustomUserDetails(authentication);
        if (maybeUserDetails.isEmpty()) return false;

        CustomUserDetails userDetails = maybeUserDetails.get();
        if (isAdmin(userDetails)) return true;

        UUID userId = userDetails.getUser().getId();

        return orderItemRepository.findById(orderItemId)
                .map(orderItem -> orderItem.getOrder() != null &&
                        orderItem.getOrder().getUser() != null &&
                        orderItem.getOrder().getUser().getId().equals(userId))
                .orElse(false);
    }

    public boolean canAccessReview(Long reviewId, Authentication authentication) {
        if (!isAuthenticated(authentication)) return false;
        if (isAdmin(authentication)) return true;

        Optional<UUID> currentUserId = getCurrentUserId(authentication);
        if (currentUserId.isEmpty()) return false;

        try {
            UUID reviewUserId = reviewService.getReviewById(reviewId).getUserId();
            return currentUserId.get().equals(reviewUserId);
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Kiểm tra xem user có quyền truy cập warranty request này không
     * @param warrantyRequestId ID của warranty request
     * @param authentication Thông tin authentication
     * @return true nếu user là admin hoặc owner của order chứa warranty request
     */
    public boolean canAccessWarrantyRequest(Long warrantyRequestId, Authentication authentication) {
        if (!isAuthenticated(authentication)) return false;
        if (isAdmin(authentication)) return true;

        Optional<UUID> currentUserId = getCurrentUserId(authentication);
        if (currentUserId.isEmpty()) return false;

        try {
            WarrantyRequest warrantyRequest = warrantyRequestRepository.findById(warrantyRequestId).orElse(null);

            if (warrantyRequest == null || warrantyRequest.getOrderItem() == null
                    || warrantyRequest.getOrderItem().getOrder() == null
                    || warrantyRequest.getOrderItem().getOrder().getUser() == null) {
                return false;
            }

            UUID orderUserId = warrantyRequest.getOrderItem().getOrder().getUser().getId();
            return orderUserId.equals(currentUserId.get());
        } catch (Exception e) {
            return false;
        }
    }

    // ---------------------- Helper methods ----------------------

    private boolean isAuthenticated(Authentication authentication) {
        return authentication != null && authentication.isAuthenticated();
    }

    /**
     * Consider both possible authority strings to be safe: "ROLE_ADMIN" and "ADMIN"
     */
    private boolean isAdmin(Authentication authentication) {
        if (authentication == null) return false;
        return authentication.getAuthorities()
                .stream()
                .anyMatch(auth -> {
                    String grant = auth.getAuthority();
                    return "ROLE_ADMIN".equals(grant) || "ADMIN".equals(grant);
                });
    }

    private boolean isAdmin(CustomUserDetails userDetails) {
        if (userDetails == null) return false;
        return userDetails.getAuthorities().stream()
                .anyMatch(a -> {
                    String grant = a.getAuthority();
                    return "ROLE_ADMIN".equals(grant) || "ADMIN".equals(grant);
                });
    }

    private Optional<UUID> getCurrentUserId(Authentication authentication) {
        if (authentication == null) return Optional.empty();
        try {
            return Optional.of(UUID.fromString(authentication.getName()));
        } catch (Exception e) {
            return Optional.empty();
        }
    }

    private Optional<CustomUserDetails> getCustomUserDetails(Authentication authentication) {
        if (authentication == null) return Optional.empty();
        Object principal = authentication.getPrincipal();
        if (principal instanceof CustomUserDetails userDetails) {
            return Optional.of(userDetails);
        }
        return Optional.empty();
    }
}
