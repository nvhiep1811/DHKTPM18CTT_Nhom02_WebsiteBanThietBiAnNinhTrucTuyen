package secure_shop.backend.dto.user;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserSummaryDTO implements Serializable {
    private UUID id;
    private String name;
    private String email;
    private String phoneNumber;
}
