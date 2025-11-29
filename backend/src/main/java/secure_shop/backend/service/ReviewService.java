package secure_shop.backend.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import secure_shop.backend.dto.product.ReviewDTO;

import java.util.List;
import java.util.UUID;

public interface ReviewService {
    ReviewDTO createReview(ReviewDTO reviewDTO);

    ReviewDTO updateReview(Long id, ReviewDTO reviewDTO);

    void deleteReview(Long id);

    ReviewDTO getReviewById(Long id);

    List<ReviewDTO> getAllReviews();

    Page<ReviewDTO> getReviewsPage(Pageable pageable);

    List<ReviewDTO> getReviewsByProductId(UUID productId);

    List<ReviewDTO> getReviewsByUserId(UUID userId);

    ReviewDTO approveReview(Long id);

    ReviewDTO rejectReview(Long id);
}