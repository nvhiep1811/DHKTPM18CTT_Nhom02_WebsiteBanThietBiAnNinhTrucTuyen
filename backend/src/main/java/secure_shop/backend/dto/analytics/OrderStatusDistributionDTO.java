package secure_shop.backend.dto.analytics;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import secure_shop.backend.enums.OrderStatus;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderStatusDistributionDTO implements Serializable {
    private OrderStatus status;
    private Long count;
}
