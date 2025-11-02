package secure_shop.backend.security;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import secure_shop.backend.config.security.CustomUserDetails;
import secure_shop.backend.entities.User;
import secure_shop.backend.repositories.UserRepository;

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

        // 1. Ưu tiên tìm bằng UUID (khi JWT gửi sub = userId)
        if (username.matches("^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$")) {
            user = userRepository.findById(UUID.fromString(username)).orElse(null);
        } else {
            // 2. Nếu không phải UUID → tìm bằng email
            user = userRepository.findByEmail(username).orElse(null);
        }

        if (user == null) {
            throw new UsernameNotFoundException("User not found: " + username);
        }

        return new CustomUserDetails(user);
    }
}