package secure_shop.backend.dto.product;

import secure_shop.backend.entities.Review;
import secure_shop.backend.enums.ReviewStatus;

import java.io.Serializable;
import java.time.Instant;
import java.util.UUID;

/**
 * DTO for {@link Review}
 */
public record ReviewDTO(
        Long id,
        Integer rating,
        String comment,
        ReviewStatus status,
        Instant createdAt,
        UUID productId,
        UUID userId,
        String userName
                        ) implements Serializable {
}