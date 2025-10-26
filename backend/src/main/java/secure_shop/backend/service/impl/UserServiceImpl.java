package secure_shop.backend.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import secure_shop.backend.entities.User;
import secure_shop.backend.repositories.UserRepository;
import secure_shop.backend.service.UserService;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder encoder;

    @Override
    public List<User> findAll() {
        return userRepository.findAll();
    }

    @Override
    public Optional<User> findById(UUID id) {
        return userRepository.findById(id);
    }

    @Override
    public User createUser(User user) {
        // Hash password if it's a plain password (not already hashed)
        String raw = user.getPasswordHash();
        if (raw != null && !raw.isBlank() && !raw.startsWith("$2a$")) {
            user.setPasswordHash(encoder.encode(raw));
        } else if (raw == null || raw.isBlank()) {
            // For OAuth users without password, generate a random secure password
            user.setPasswordHash(encoder.encode(UUID.randomUUID().toString()));
        }

        User savedUser = userRepository.save(user);
        log.info("User created: {} (provider: {})", savedUser.getEmail(), savedUser.getProvider());
        return savedUser;
    }

    @Override
    public User updateUser(UUID id, User req) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Update basic fields
        if (req.getName() != null) {
            user.setName(req.getName());
        }
        if (req.getEmail() != null) {
            user.setEmail(req.getEmail());
        }
        if (req.getAvatarUrl() != null) {
            user.setAvatarUrl(req.getAvatarUrl());
        }
        if (req.getProvider() != null) {
            user.setProvider(req.getProvider());
        }
        if (req.getRole() != null) {
            user.setRole(req.getRole());
        }

        // Update password if provided
        String newPass = req.getPasswordHash();
        if (newPass != null && !newPass.isBlank()) {
            if (!newPass.startsWith("$2a$")) {
                newPass = encoder.encode(newPass);
            }
            user.setPasswordHash(newPass);
        }

        User updatedUser = userRepository.save(user);
        log.info("User updated: {}", updatedUser.getEmail());
        return updatedUser;
    }

    @Override
    public void deleteById(UUID id) {
        userRepository.deleteById(id);
        log.info("User deleted: {}", id);
    }

    @Override
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    @Override
    public User findOrCreateFromOAuth(Map<String, Object> attributes,
                                      String provider) {
        String email = (String) attributes.get("email");
        String name = (String) attributes.get("name");

        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Email is required for OAuth user");
        }

        return userRepository.findByEmail(email)
                .map(existingUser -> {
                    // Update provider if not set
                    if (existingUser.getProvider() == null) {
                        existingUser.setProvider(provider);
                        return userRepository.save(existingUser);
                    }
                    return existingUser;
                })
                .orElseGet(() -> {
                    User newUser = new User();
                    newUser.setEmail(email);
                    newUser.setName(name != null ? name : email);
                    newUser.setProvider(provider);

                    // Set secure random password for OAuth users
                    newUser.setPasswordHash(encoder.encode(UUID.randomUUID().toString()));

                    // Extract avatar
                    Object pictureObj = attributes.get("picture");
                    if (pictureObj instanceof String s) {
                        newUser.setAvatarUrl(s);
                    } else if (pictureObj instanceof Map<?, ?> picMap) {
                        Object dataObj = picMap.get("data");
                        if (dataObj instanceof Map<?, ?> dataMap) {
                            Object urlObj = dataMap.get("url");
                            if (urlObj instanceof String sUrl) {
                                newUser.setAvatarUrl(sUrl);
                            }
                        }
                    }

                    User savedUser = userRepository.save(newUser);
                    log.info("New OAuth user created: {} via {}", email, provider);
                    return savedUser;
                });
    }

    @Override
    public User findOrCreateOAuthUser(String email, String name) {
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Email is required");
        }

        return userRepository.findByEmail(email)
                .orElseGet(() -> {
                    User newUser = new User();
                    newUser.setEmail(email);
                    newUser.setName(name != null ? name : email);
                    newUser.setProvider("oauth"); // Generic OAuth provider
                    newUser.setPasswordHash(encoder.encode(UUID.randomUUID().toString()));

                    User savedUser = userRepository.save(newUser);
                    log.info("New OAuth user created: {}", email);
                    return savedUser;
                });
    }
}