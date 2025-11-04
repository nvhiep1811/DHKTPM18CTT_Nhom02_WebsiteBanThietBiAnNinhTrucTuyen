package secure_shop.backend.dto.order.request;

import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotNull;
import java.io.Serializable;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OrderItemRequest implements Serializable {
    @NotNull
    private UUID productId;

    @NotNull
    @Positive
    private Integer quantity;
}
