package secure_shop.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import secure_shop.backend.dto.user.UserDTO;
import secure_shop.backend.dto.user.UserProfileDTO;
import secure_shop.backend.config.security.CustomUserDetails;
import secure_shop.backend.entities.User;
import secure_shop.backend.enums.Role;
import secure_shop.backend.mapper.UserMapper;
import secure_shop.backend.service.UserService;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService service;

    // Current user
    @GetMapping("/me")
    public ResponseEntity<UserProfileDTO> getCurrentUser(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        UserProfileDTO profile = service.getUserProfile(userDetails.getUser().getId());
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/me")
    public ResponseEntity<UserProfileDTO> updateProfile(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody User req) {
        return ResponseEntity.ok(new UserMapper().toDTO(service.updateUser(userDetails.getUser().getId(), req)));
    }

    @DeleteMapping("/me")
    public ResponseEntity<?> deleteMyAccount(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        service.softDeleteUser(userDetails.getUser().getId());
        return ResponseEntity.ok(Map.of("message", "Account deleted successfully"));
    }

    // Admin
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<UserDTO>> getAllUsers(
            @PageableDefault(size = 20, sort = "createdAt") Pageable pageable,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Role role,
            @RequestParam(required = false) Boolean enabled,
            @RequestParam(required = false, defaultValue = "false") Boolean includeDeleted,
            @RequestParam(required = false) String provider) {

        Page<UserDTO> users = service.getAllUsers(
                pageable,
                search,
                role,
                enabled,
                includeDeleted,
                provider
        );

        return ResponseEntity.ok(users);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDTO> getUserById(@PathVariable UUID id) {
        UserDTO user = service.getUserById(id);
        return ResponseEntity.ok(user);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable UUID id) {
        service.softDeleteUser(id);
        return ResponseEntity.ok(Map.of("message", "User deleted"));
    }

    @PutMapping("/{id}/restore")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDTO> restoreUser(@PathVariable UUID id) {
        UserDTO restored = service.restoreUser(id);
        return ResponseEntity.ok(restored);
    }

    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getUserStats() {
        Map<String, Object> stats = service.getUserStats();
        return ResponseEntity.ok(stats);
    }

    @PutMapping("/admin/{id}/enable")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> enableUser(@PathVariable UUID id) {
        service.enableUser(id);
        return ResponseEntity.ok(Map.of("message", "User enabled"));
    }

    @PutMapping("/admin/{id}/disable")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> disableUser(@PathVariable UUID id) {
        service.disableUser(id);
        return ResponseEntity.ok(Map.of("message", "User disabled"));
    }
}
