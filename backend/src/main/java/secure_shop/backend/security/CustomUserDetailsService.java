package secure_shop.backend.security;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import secure_shop.backend.entities.User;
import secure_shop.backend.repositories.UserRepository;

import java.util.Collections;
import java.util.UUID;

/**
 * Custom UserDetailsService that loads users by email or UUID
 * for both local and OAuth authentication
 */
@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user;

        // Try to load by UUID first (for JWT authentication)
        try {
            UUID userId = UUID.fromString(username);
            user = userRepository.findById(userId)
                    .orElse(null);
        } catch (IllegalArgumentException e) {
            // Not a valid UUID, try email
            user = null;
        }

        // If not found by UUID, try email (for form login)
        if (user == null) {
            user = userRepository.findByEmail(username)
                    .orElseThrow(() -> new UsernameNotFoundException(
                            "User not found: " + username));
        }

        return buildUserDetails(user);
    }

    private UserDetails buildUserDetails(User user) {
        String role = "ROLE_" + (user.getRole() != null ? user.getRole().name() : "USER");

        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getId().toString()) // Use UUID as username
                .password(user.getPasswordHash() != null ? user.getPasswordHash() : "")
                .authorities(Collections.singletonList(new SimpleGrantedAuthority(role)))
                .accountExpired(false)
                .accountLocked(false)
                .credentialsExpired(false)
                .disabled(false)
                .build();
    }
}