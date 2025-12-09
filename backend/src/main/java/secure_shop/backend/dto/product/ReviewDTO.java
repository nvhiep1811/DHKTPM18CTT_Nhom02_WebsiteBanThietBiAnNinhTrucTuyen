package secure_shop.backend.dto.product;

import lombok.*;
import secure_shop.backend.enums.ReviewStatus;

import java.io.Serializable;
import java.time.Instant;
import java.util.UUID;

/**
 * DTO for {@link secure_shop.backend.entities.Review}
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ReviewDTO implements Serializable {
    private Long id;
    private Integer rating;
    private String comment;
    private ReviewStatus status;
    private Instant createdAt;

    // Foreign keys
    private UUID productId;
    private UUID userId;

    /**
     * The specific order item being reviewed
     * This ensures one review per order item
     */
    private Long orderItem;

    // Nested objects for display (optional)
    private String userName;
    private String productName;
}