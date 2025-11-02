package secure_shop.backend.dto.request;

import lombok.Data;

@Data
public class CreateAddressRequest {
    private String name;
    private String phone;
    private String street;
    private String ward;
    private String province;
    private Boolean isDefault = false;
}