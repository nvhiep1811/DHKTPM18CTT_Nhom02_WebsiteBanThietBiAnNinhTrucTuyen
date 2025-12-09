package secure_shop.backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import secure_shop.backend.entities.Review;
import secure_shop.backend.enums.ReviewStatus;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByProductId(UUID productId);

    List<Review> findByUserId(UUID userId);

    List<Review> findByProductIdAndStatus(UUID productId, ReviewStatus status);

    boolean existsByOrderItemId(Long orderItemId);

    /**
     * Find a review by order item ID
     * Used to get the review associated with a specific order item
     */
    Optional<Review> findByOrderItemId(Long orderItemId);

    @Query("SELECT r FROM Review r WHERE r.user.id = :userId AND r.status = :status")
    List<Review> findByUserIdAndStatus(@Param("userId") UUID userId,
                                       @Param("status") ReviewStatus status);
}