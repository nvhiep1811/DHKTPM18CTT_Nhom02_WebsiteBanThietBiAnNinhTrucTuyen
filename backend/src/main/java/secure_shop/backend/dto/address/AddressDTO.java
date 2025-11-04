package secure_shop.backend.dto.address;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AddressDTO {
    private Long id;
    private String name;
    private String phone;
    private String street;
    private String ward;
    private String province;
    private Boolean isDefault;
    private UUID userId;
}