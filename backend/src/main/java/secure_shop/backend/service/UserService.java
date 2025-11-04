package secure_shop.backend.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import secure_shop.backend.dto.user.UserDTO;
import secure_shop.backend.dto.user.UserProfileDTO;
import secure_shop.backend.entities.User;
import secure_shop.backend.enums.Role;
import secure_shop.backend.dto.auth.RegisterRequest;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

public interface UserService {
    Optional<User> findById(UUID id);

    User createUser(User user);
    User updateUser(UUID id, User user);
    void softDeleteUser(UUID id);
    UserDTO restoreUser(UUID userId);
    void disableUser(UUID userId);
    void enableUser(UUID userId);

    Optional<User> findByEmail(String email);

    UserProfileDTO getUserProfile(UUID id);
    UserDTO getUserById(UUID id);

    Page<UserDTO> getAllUsers(Pageable pageable,
                                           String search,
                                           Role role,
                                           Boolean enabled,
                                           Boolean includeDeleted,
                                           String provider);
    Map<String, Object> getUserStats();

    void changePassword(User user, String currentPassword, String newPassword);

    boolean updatePassword(String email, String newPassword);

    User registerUser(RegisterRequest request);
}
