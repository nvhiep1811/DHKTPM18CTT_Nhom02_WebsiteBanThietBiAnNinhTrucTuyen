package secure_shop.backend.dto.analytics;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TopProductDTO implements Serializable {
    private UUID id;
    private String name;
    private String thumbnailUrl;
    private Long totalQuantitySold;
    private BigDecimal totalRevenue;
}
