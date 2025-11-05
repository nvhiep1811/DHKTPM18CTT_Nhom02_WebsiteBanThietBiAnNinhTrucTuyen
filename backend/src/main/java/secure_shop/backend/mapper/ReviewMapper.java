package secure_shop.backend.mapper;

import org.springframework.stereotype.Component;
import secure_shop.backend.dto.product.ReviewDTO;
import secure_shop.backend.entities.Product;
import secure_shop.backend.entities.Review;
import secure_shop.backend.entities.User;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class ReviewMapper {

    public ReviewDTO toDTO(Review review) {
        if (review == null) return null;

        return ReviewDTO.builder()
                .id(review.getId())
                .rating(review.getRating())
                .comment(review.getComment())
                .status(review.getStatus())
                .createdAt(review.getCreatedAt())
                .productId(review.getProduct() != null ? review.getProduct().getId() : null)
                .userId(review.getUser() != null ? review.getUser().getId() : null)
                .userName(review.getUser() != null ? review.getUser().getName() : null)
                .build();
    }

    public Review toEntity(ReviewDTO dto) {
        if (dto == null) return null;

        Review review = new Review();
        review.setId(dto.getId());
        review.setRating(dto.getRating());
        review.setComment(dto.getComment());

        if (dto.getStatus() != null) {
            review.setStatus(dto.getStatus());
        }

        if (dto.getProductId() != null) {
            Product product = new Product();
            product.setId(dto.getProductId());
            review.setProduct(product);
        }

        if (dto.getUserId() != null) {
            User user = new User();
            user.setId(dto.getUserId());
            review.setUser(user);
        }

        return review;
    }

    public List<ReviewDTO> toDTOList(List<Review> reviews) {
        if (reviews == null) return List.of();
        return reviews.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public void updateEntityFromDTO(ReviewDTO dto, Review entity) {
        if (dto == null || entity == null) return;

        if (dto.getRating() != null) entity.setRating(dto.getRating());
        if (dto.getComment() != null) entity.setComment(dto.getComment());
        if (dto.getStatus() != null) entity.setStatus(dto.getStatus());
    }
}

