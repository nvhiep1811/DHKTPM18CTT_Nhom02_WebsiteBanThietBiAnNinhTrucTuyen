package secure_shop.backend.mapper;

import org.springframework.stereotype.Component;
import secure_shop.backend.dto.product.ReviewDTO;
import secure_shop.backend.entities.Review;

@Component
public class ReviewMapper {

    /**
     * Convert Review entity to ReviewDTO
     */
    public ReviewDTO toDTO(Review review) {
        if (review == null) {
            return null;
        }

        return ReviewDTO.builder()
                .id(review.getId())
                .rating(review.getRating())
                .comment(review.getComment())
                .status(review.getStatus())
                .createdAt(review.getCreatedAt())
                .productId(review.getProduct() != null ? review.getProduct().getId() : null)
                .productName(review.getProduct() != null ? review.getProduct().getName() : null)
                .userId(review.getUser() != null ? review.getUser().getId() : null)
                .userName(review.getUser() != null ? review.getUser().getName() : null)
                .orderItem(review.getOrderItem() != null ? review.getOrderItem().getId() : null)
                .build();
    }

    /**
     * Convert ReviewDTO to Review entity (for creation)
     * Note: Product, User, and OrderItem must be set separately in the service
     */
    public Review toEntity(ReviewDTO dto) {
        if (dto == null) {
            return null;
        }

        return Review.builder()
                .id(dto.getId())
                .rating(dto.getRating())
                .comment(dto.getComment())
                .status(dto.getStatus())
                .build();
    }

    /**
     * Update existing Review entity from ReviewDTO
     * Only updates mutable fields (rating and comment)
     */
    public void updateEntityFromDTO(ReviewDTO dto, Review review) {
        if (dto == null || review == null) {
            return;
        }

        if (dto.getRating() != null) {
            review.setRating(dto.getRating());
        }

        if (dto.getComment() != null) {
            review.setComment(dto.getComment());
        }

        // Note: We don't update status, product, user, or orderItem here
        // Those are managed by specific service methods
    }
}