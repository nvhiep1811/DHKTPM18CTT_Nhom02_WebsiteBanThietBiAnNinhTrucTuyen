package secure_shop.backend.dto.product;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MediaAssetDTO {
    private Long id;
    private String url;
    private String altText;
    private String productName;
    private String productId; // UUID
}