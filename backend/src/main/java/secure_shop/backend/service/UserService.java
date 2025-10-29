package secure_shop.backend.service;

import secure_shop.backend.dto.UserDTO;
import secure_shop.backend.entities.User;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

public interface UserService {
    Optional<User> findById(UUID id);
    User createUser(User user);
    User updateUser(UUID id, User user);
    void deleteById(UUID id);
    Optional<User> findByEmail(String email);

    UserDTO getUserById(UUID id);
    List<UserDTO> getAllUsers();
}
