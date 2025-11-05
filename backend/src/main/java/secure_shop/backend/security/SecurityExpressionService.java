package secure_shop.backend.security;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import secure_shop.backend.dto.order.OrderDetailsDTO;
import secure_shop.backend.entities.WarrantyRequest;
import secure_shop.backend.repositories.WarrantyRequestRepository;
import secure_shop.backend.service.OrderService;
import secure_shop.backend.service.ReviewService;

import java.util.UUID;

@Service("securityService")
@RequiredArgsConstructor
public class SecurityExpressionService {

    private final OrderService orderService;
    private final ReviewService reviewService;
    private final WarrantyRequestRepository warrantyRequestRepository;

    /**
     * Kiểm tra xem user có quyền truy cập order này không
     * @param orderId ID của order
     * @param authentication Thông tin authentication
     * @return true nếu user là admin hoặc owner của order
     */
    public boolean canAccessOrder(UUID orderId, Authentication authentication) {
        boolean isAdmin = authentication.getAuthorities()
                .stream()
                .anyMatch(auth -> auth.getAuthority().equals("ADMIN"));
        if (isAdmin) {
            return true;
        }

        try {
            UUID currentUserId = UUID.fromString(authentication.getName());
            OrderDetailsDTO order = orderService.getOrderDetailsById(orderId);
            return order.getUser().getId().equals(currentUserId);
        } catch (Exception e) {
            return false;
        }
    }

    public boolean canAccessReview(Long reviewId, Authentication authentication) {
        boolean isAdmin = authentication.getAuthorities()
                .stream()
                .anyMatch(auth -> auth.getAuthority().equals("ADMIN"));
        if (isAdmin) {
            return true;
        }

        try {
            UUID currentUserId = UUID.fromString(authentication.getName());
            UUID reviewUserId = reviewService.getReviewById(reviewId).getUserId();
            return reviewUserId.equals(currentUserId);
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
        boolean isAdmin = authentication.getAuthorities()
                .stream()
                .anyMatch(auth -> auth.getAuthority().equals("ADMIN"));
        if (isAdmin) {
            return true;
        }

        try {
            UUID currentUserId = UUID.fromString(authentication.getName());
            WarrantyRequest warrantyRequest = warrantyRequestRepository.findById(warrantyRequestId)
                    .orElse(null);

            if (warrantyRequest == null || warrantyRequest.getOrderItem() == null
                    || warrantyRequest.getOrderItem().getOrder() == null
                    || warrantyRequest.getOrderItem().getOrder().getUser() == null) {
                return false;
            }

            UUID orderUserId = warrantyRequest.getOrderItem().getOrder().getUser().getId();
            return orderUserId.equals(currentUserId);
        } catch (Exception e) {
            return false;
        }
    }
}
