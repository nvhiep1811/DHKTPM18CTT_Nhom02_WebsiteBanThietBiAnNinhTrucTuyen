package secure_shop.backend.dto.discount.request;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import secure_shop.backend.enums.DiscountType;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class DiscountUpdateRequest {
    @NotBlank
    private String code;

    @NotNull(message = "Loại giảm giá không được để trống")
    private DiscountType discountType;

    @NotNull(message = "Giá trị giảm không được để trống")
    @DecimalMin(value = "0.01", inclusive = true, message = "Giá trị giảm phải lớn hơn 0")
    @Digits(integer = 13, fraction = 2, message = "Giá trị giảm không hợp lệ (tối đa 13 chữ số và 2 số thập phân)")
    private BigDecimal discountValue;

    @DecimalMin(value = "0.0", inclusive = true, message = "Giá trị đơn hàng tối thiểu không được âm")
    @Digits(integer = 13, fraction = 2, message = "Giá trị đơn hàng tối thiểu không hợp lệ")
    private BigDecimal minOrderValue;

    @DecimalMin(value = "0.0", inclusive = true, message = "Giới hạn số lần sử dụng không được âm")
    @Digits(integer = 13, fraction = 2, message = "Giới hạn số lần sử dụng không hợp lệ")
    private BigDecimal maxUsage;

    @Min(value = 1, message = "Giới hạn mỗi người dùng ít nhất là 1 lần")
    private Integer perUserLimit;

    @NotNull(message = "Thời gian bắt đầu không được để trống")
    private Instant startAt;

    @NotNull(message = "Thời gian kết thúc không được để trống")
    private Instant endAt;

    @NotNull(message = "Trạng thái hoạt động không được để trống")
    private Boolean active;
}
