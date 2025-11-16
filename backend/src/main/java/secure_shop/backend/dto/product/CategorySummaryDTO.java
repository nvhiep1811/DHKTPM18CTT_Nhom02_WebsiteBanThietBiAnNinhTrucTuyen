package secure_shop.backend.dto.product;

import lombok.*;

import java.io.Serializable;
import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategorySummaryDTO implements Serializable {
    private Long id;
    private String name;
    private String imageUrl;
    private String description;
    private Boolean active;
}
