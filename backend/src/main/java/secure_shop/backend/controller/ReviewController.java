package secure_shop.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import secure_shop.backend.config.security.CustomUserDetails;
import secure_shop.backend.dto.product.ReviewDTO;
import secure_shop.backend.service.ReviewService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping
    public ResponseEntity<Page<ReviewDTO>> getAllReviews(@PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(reviewService.getReviewsPage(pageable));
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<ReviewDTO>> getReviewsByProduct(@PathVariable UUID productId) {
        return ResponseEntity.ok(reviewService.getReviewsByProductId(productId));
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ReviewDTO>> getReviewsByUser(
            @PathVariable UUID userId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        UUID currentUserId = userDetails.getUser().getId();
        boolean isAdmin = userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        if (!isAdmin && !currentUserId.equals(userId)) {
            throw new AccessDeniedException("Không được phép truy cập đánh giá của người dùng khác.");
        }

        return ResponseEntity.ok(reviewService.getReviewsByUserId(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReviewDTO> getReviewById(@PathVariable Long id) {
        return ResponseEntity.ok(reviewService.getReviewById(id));
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ReviewDTO> createReview(@RequestBody ReviewDTO dto,
                                                  @AuthenticationPrincipal CustomUserDetails userDetails) {
        dto.setUserId(userDetails.getUser().getId());
        ReviewDTO saved = reviewService.createReview(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    @PreAuthorize("@securityService.canAccessReview(#id, authentication)")
    public ResponseEntity<ReviewDTO> updateReview(@PathVariable Long id, @RequestBody ReviewDTO dto) {
        return ResponseEntity.ok(reviewService.updateReview(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("@securityService.canAccessReview(#id, authentication)")
    public ResponseEntity<Void> deleteReview(@PathVariable Long id) {
        reviewService.deleteReview(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/approve/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ReviewDTO> approveReview(@PathVariable Long id) {
        return ResponseEntity.ok(reviewService.approveReview(id));
    }

    @PatchMapping("/reject/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ReviewDTO> rejectReview(@PathVariable Long id) {
        return ResponseEntity.ok(reviewService.rejectReview(id));
    }
}

