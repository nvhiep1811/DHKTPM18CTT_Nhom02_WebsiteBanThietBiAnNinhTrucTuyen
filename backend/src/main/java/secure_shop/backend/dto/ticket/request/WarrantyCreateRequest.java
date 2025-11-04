package secure_shop.backend.dto.ticket.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class WarrantyCreateRequest implements Serializable {
    @NotNull(message = "Mã sản phẩm trong đơn hàng không được để trống")
    private Long orderItemId;

    @NotBlank(message = "Loại sự cố không được để trống")
    @Size(max = 100, message = "Loại sự cố tối đa 100 ký tự")
    private String issueType;

    @Size(max = 2000, message = "Mô tả sự cố tối đa 2000 ký tự")
    private String description;
}
