package secure_shop.backend.specification;

import org.springframework.data.jpa.domain.Specification;
import secure_shop.backend.enums.Role;
import secure_shop.backend.entities.User;

public class UserSpecification {

    public static Specification<User> searchByNameOrEmail(String search) {
        return (root, query, cb) -> {
            String pattern = "%" + search.toLowerCase() + "%";
            return cb.or(
                    cb.like(cb.lower(root.get("name")), pattern),
                    cb.like(cb.lower(root.get("email")), pattern)
            );
        };
    }

    public static Specification<User> hasRole(Role role) {
        return (root, query, cb) -> cb.equal(root.get("role"), role);
    }

    public static Specification<User> isEnabled(Boolean enabled) {
        return (root, query, cb) -> cb.equal(root.get("enabled"), enabled);
    }

    public static Specification<User> hasProvider(String provider) {
        return (root, query, cb) -> cb.equal(root.get("provider"), provider);
    }

    public static Specification<User> isNotDeleted() {
        return (root, query, cb) -> cb.isNull(root.get("deletedAt"));
    }

    public static Specification<User> isDeleted() {
        return (root, query, cb) -> cb.isNotNull(root.get("deletedAt"));
    }
}
