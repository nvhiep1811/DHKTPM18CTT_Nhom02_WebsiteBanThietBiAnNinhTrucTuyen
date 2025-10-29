package secure_shop.backend.dto;

import lombok.*;
import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDTO {
    private UUID id;
    private String email;
    private String name;
    private String phone;
    private String avatarUrl;
    private String role;
    private Boolean enabled;
    private Instant createdAt;
}