package secure_shop.backend.dto.user;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
public class UserDTO {
    private UUID id;
    private String email;
    private String name;
    private String phone;
    private String avatarUrl;
    private String role;
    private String provider;
    private Boolean enabled;
    private Instant deletedAt;
    private Instant createdAt;
    private Instant updatedAt;
}
