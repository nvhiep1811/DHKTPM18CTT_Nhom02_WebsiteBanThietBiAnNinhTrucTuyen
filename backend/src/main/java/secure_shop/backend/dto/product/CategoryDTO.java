package secure_shop.backend.dto.product;

import java.io.Serializable;
import java.time.Instant;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryDTO implements Serializable {
    private Long id;
    private String name;
    private String description;
    private String imageUrl;
    private Boolean active;
    private Instant createdAt;
    private Instant updatedAt;
}
