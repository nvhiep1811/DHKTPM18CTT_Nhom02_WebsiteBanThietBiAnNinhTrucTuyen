package secure_shop.backend.dto.order;

import lombok.*;
import secure_shop.backend.enums.ShipmentStatus;

import java.io.Serializable;
import java.time.Instant;
import java.util.UUID;

/**
 * DTO for {@link secure_shop.backend.entities.Shipment}
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ShipmentDTO implements Serializable {
    Long id;
    ShipmentStatus status;
    Instant deliveredAt;
    Instant shippedAt;
    UUID orderId;
}