package secure_shop.backend.dto.analytics;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RevenueDataPointDTO implements Serializable {
    private String date; // Format: yyyy-MM-dd
    private BigDecimal revenue;
    private Long orderCount;
}
