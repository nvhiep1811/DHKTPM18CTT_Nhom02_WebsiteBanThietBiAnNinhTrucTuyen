package secure_shop.backend.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import secure_shop.backend.dto.UserProfileDTO;
import secure_shop.backend.entities.User;
import secure_shop.backend.mapper.UserMapper;
import secure_shop.backend.repositories.UserRepository;
import secure_shop.backend.service.UserService;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder encoder;
    private final UserMapper userMapper;

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
    @Transactional(readOnly = true)
    public UserProfileDTO getUserById(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return userMapper.toDTO(user);  // ✅ Convert ngay trong transaction
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserProfileDTO> getAllUsers() {
        List<User> users = userRepository.findAll();
        return userMapper.toDTOList(users);  // ✅ Convert trong transaction
    }
}