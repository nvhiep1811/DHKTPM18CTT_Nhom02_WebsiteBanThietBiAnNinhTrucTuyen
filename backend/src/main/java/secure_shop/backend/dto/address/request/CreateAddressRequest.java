package secure_shop.backend.dto.address.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateAddressRequest {
    @NotBlank(message = "Tên người nhận không được để trống")
    @Size(max = 100, message = "Tên người nhận tối đa 100 ký tự")
    private String name;

    @NotBlank(message = "Số điện thoại không được để trống")
    @Pattern(
            regexp = "^(\\+\\d{1,3}[- ]?)?\\d{9,15}$",
            message = "Số điện thoại không hợp lệ"
    )
    private String phone;

    @NotBlank(message = "Địa chỉ (đường, số nhà) không được để trống")
    @Size(max = 255, message = "Địa chỉ tối đa 255 ký tự")
    private String street;

    @NotBlank(message = "Phường / Xã không được để trống")
    @Size(max = 100, message = "Tên phường / xã tối đa 100 ký tự")
    private String ward;

    @NotBlank(message = "Tỉnh / Thành phố không được để trống")
    @Size(max = 100, message = "Tên tỉnh / thành phố tối đa 100 ký tự")
    private String province;

    private Boolean isDefault = false;
}