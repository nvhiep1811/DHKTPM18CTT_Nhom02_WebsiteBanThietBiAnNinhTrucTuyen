package secure_shop.backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;
import secure_shop.backend.entities.User;
import secure_shop.backend.enums.Role;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID>, JpaSpecificationExecutor<User> {
    Optional<User> findByEmail(String email);

    long countByDeletedAtIsNull();
    long countByDeletedAtIsNotNull();
    long countByEnabledTrueAndDeletedAtIsNull();
    long countByEnabledFalseAndDeletedAtIsNull();
    long countByRoleAndDeletedAtIsNull(Role role);
    long countByProviderAndDeletedAtIsNull(String provider);
}
