package secure_shop.backend.dto.product;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import secure_shop.backend.entities.Review;
import secure_shop.backend.enums.ReviewStatus;

import java.io.Serializable;
import java.time.Instant;
import java.util.UUID;

/**
 * DTO for {@link Review}
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewDTO implements Serializable {
    private Long id;
    private Integer rating;
    private String comment;
    private ReviewStatus status;
    private Instant createdAt;
    private UUID productId;
    private UUID userId;
    private String userName;
    private Long orderItem;
}