package secure_shop.backend.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Data;
import secure_shop.backend.entities.User;

@Data
@AllArgsConstructor
public class LoginResponse {
    private String accessToken;
    private String refreshToken;
    private User user;
}