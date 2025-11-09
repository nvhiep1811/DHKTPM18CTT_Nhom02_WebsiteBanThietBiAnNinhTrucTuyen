package secure_shop.backend.service.impl;

import jakarta.validation.ValidationException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import secure_shop.backend.dto.user.UserDTO;
import secure_shop.backend.dto.user.UserProfileDTO;
import secure_shop.backend.entities.User;
import secure_shop.backend.enums.Role;
import secure_shop.backend.mapper.UserMapper;
import secure_shop.backend.repositories.UserRepository;
import secure_shop.backend.service.UserService;
import secure_shop.backend.specification.UserSpecification;
import secure_shop.backend.dto.auth.RegisterRequest;

import secure_shop.backend.exception.BusinessRuleViolationException;
import secure_shop.backend.exception.ConflictException;
import secure_shop.backend.exception.ResourceNotFoundException;
import secure_shop.backend.service.VerificationService;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder encoder;
    private final UserMapper userMapper;
    private final VerificationService verificationService;

    @Override
    public Optional<User> findById(UUID id) {
        return userRepository.findById(id);
    }

    @Override
    public User createUser(User user) {
        // Hash password if it's a plain password (not already hashed)
        String raw = user.getPasswordHash();
        if ("local".equals(user.getProvider())) {
            if (raw == null || raw.isBlank()) {
                throw new ValidationException("Mật khẩu không được để trống!");
            }
            if (!raw.startsWith("$2a$")) {
                user.setPasswordHash(encoder.encode(raw));
            }
        } else {
            // OAuth users
            if (raw == null || raw.isBlank()) {
                user.setPasswordHash(encoder.encode(UUID.randomUUID().toString()));
            }
        }

        User savedUser = userRepository.save(user);
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
        if (req.getPhone() != null) {
            user.setPhone(req.getPhone());
        }
        if (req.getAvatarUrl() != null) {
            user.setAvatarUrl(req.getAvatarUrl());
        }
        if (req.getProvider() != null) {
            user.setProvider(req.getProvider());
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
        return updatedUser;
    }

    @Override
    public void softDeleteUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        if (user.getDeletedAt() != null) {
            throw new BusinessRuleViolationException("User already deleted");
        }

        user.setDeletedAt(Instant.now());
        userRepository.save(user);
    }

    @Override
    public UserDTO restoreUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        if (user.getDeletedAt() == null) {
            throw new BusinessRuleViolationException("User is not deleted");
        }

        user.setDeletedAt(null);
        return userMapper.mapToDTO(userRepository.save(user));
    }

    @Override
    public void disableUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        if (user.getDeletedAt() != null) {
            throw new BusinessRuleViolationException("Cannot disable deleted user. Restore first.");
        }

        user.setEnabled(false);
        userRepository.save(user);
    }

    @Override
    public void enableUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        if (user.getDeletedAt() != null) {
            throw new BusinessRuleViolationException("Cannot enable deleted user. Restore first.");
        }

        user.setEnabled(true);
        userRepository.save(user);
    }

    @Override
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    @Override
    @Transactional(readOnly = true)
    public UserProfileDTO getUserProfile(UUID id) {
        User user = findUserById(id);

        return userMapper.toDTO(user);
    }

    @Override
    @Transactional(readOnly = true)
    public UserDTO getUserById(UUID userId) {
        User user = findUserById(userId);
        return userMapper.mapToDTO(user);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<UserDTO> getAllUsers(
            Pageable pageable,
            String search,
            Role role,
            Boolean enabled,
            Boolean includeDeleted,
            String provider) {

        Specification<User> spec = (root, query, criteriaBuilder) -> criteriaBuilder.conjunction();

        // Tìm kiếm theo tên hoặc email
        if (search != null && !search.isBlank()) {
            spec = spec.and(UserSpecification.searchByNameOrEmail(search.trim()));
        }

        // Lọc theo role
        if (role != null) {
            spec = spec.and(UserSpecification.hasRole(role));
        }

        // Lọc theo trạng thái kích hoạt
        if (enabled != null) {
            spec = spec.and(UserSpecification.isEnabled(enabled));
        }

        // Lọc theo provider (Google, Local, ...)
        if (provider != null && !provider.isBlank()) {
            spec = spec.and(UserSpecification.hasProvider(provider.trim()));
        }

        // Mặc định loại bỏ user đã xóa, trừ khi includeDeleted = true
        if (includeDeleted == null || !includeDeleted) {
            spec = spec.and(UserSpecification.isNotDeleted());
        }

        return userRepository.findAll(spec, pageable)
                .map(userMapper::mapToDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getUserStats() {
        Map<String, Object> stats = new HashMap<>();

        stats.put("totalUsers", userRepository.count());
        stats.put("activeUsers", userRepository.countByDeletedAtIsNull());
        stats.put("deletedUsers", userRepository.countByDeletedAtIsNotNull());
        stats.put("enabledUsers", userRepository.countByEnabledTrueAndDeletedAtIsNull());
        stats.put("disabledUsers", userRepository.countByEnabledFalseAndDeletedAtIsNull());

        // Count by role
        Map<String, Long> roleStats = new HashMap<>();
        for (Role role : Role.values()) {
            long count = userRepository.countByRoleAndDeletedAtIsNull(role);
            roleStats.put(role.name(), count);
        }
        stats.put("byRole", roleStats);

        // Count by provider
        Map<String, Long> providerStats = new HashMap<>();
        providerStats.put("local", userRepository.countByProviderAndDeletedAtIsNull("local"));
        providerStats.put("google", userRepository.countByProviderAndDeletedAtIsNull("google"));
        providerStats.put("facebook", userRepository.countByProviderAndDeletedAtIsNull("facebook"));
        stats.put("byProvider", providerStats);

        return stats;
    }

    public void changePassword(User user, String currentPassword, String newPassword) {
        if (!encoder.matches(currentPassword, user.getPasswordHash())) {
            throw new BadCredentialsException("Incorrect current password");
        }
        user.setPasswordHash(encoder.encode(newPassword));
        userRepository.save(user);
    }

    public boolean updatePassword(String email, String newPassword) {
        return userRepository.findByEmail(email).map(user -> {
            user.setPasswordHash(encoder.encode(newPassword));
            userRepository.save(user);
            return true;
        }).orElse(false);
    }

    private User findUserById(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
    }

    @Override
    public User registerUser(RegisterRequest request) {
        // 1. Kiểm tra xem email đã tồn tại chưa
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new ConflictException("Email này đã được sử dụng.");
        }

        // 2. Hash mật khẩu
        String hashedPassword = encoder.encode(request.getPassword());

        // 3. Tạo đối tượng User mới
        User newUser = User.builder()
                .email(request.getEmail())
                .passwordHash(hashedPassword)
                .name(request.getName())
                .phone(request.getPhone())
                .provider("local")
                .enabled(false) // ⚠️ THAY ĐỔI: Chưa kích hoạt, cần xác thực email
                .role(Role.USER)
                .build();

        // 4. Lưu vào database
        User savedUser = userRepository.save(newUser);

        // 5. Gửi email xác thực
        if (savedUser != null) {
            verificationService.sendVerificationEmail(savedUser.getEmail(), savedUser.getId().toString());
        }

        return savedUser;
    }
}