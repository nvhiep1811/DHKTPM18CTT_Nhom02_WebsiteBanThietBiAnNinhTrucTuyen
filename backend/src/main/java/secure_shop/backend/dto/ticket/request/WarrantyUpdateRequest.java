package secure_shop.backend.dto.ticket.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.Instant;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class WarrantyUpdateRequest implements Serializable {
    @NotNull(message = "Mã yêu cầu bảo hành không được để trống")
    private Long id;

    @NotBlank(message = "Trạng thái bảo hành không được để trống")
    private String status;

    private Instant resolvedAt;

    @Size(max = 2000, message = "Ghi chú tối đa 2000 ký tự")
    private String notes;
}
