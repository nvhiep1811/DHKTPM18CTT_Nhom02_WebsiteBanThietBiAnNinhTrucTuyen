package secure_shop.backend.dto.order.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderStatusChangeRequest {

    @NotBlank(message = "Trạng thái không được để trống")
    private String status;
}

