package secure_shop.backend.service;

import secure_shop.backend.entities.User;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

public interface UserService {
    List<User> findAll();
    Optional<User> findById(UUID id);
    User createUser(User user);
    User updateUser(UUID id, User user);
    void deleteById(UUID id);
    Optional<User> findByEmail(String email);

    User findOrCreateFromOAuth(Map<String, Object> attributes, String authorizedClientRegistrationId);

    User findOrCreateOAuthUser(String email, String name);
}
