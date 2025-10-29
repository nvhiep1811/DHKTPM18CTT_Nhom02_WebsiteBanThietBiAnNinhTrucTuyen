package secure_shop.backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import secure_shop.backend.entities.Discount;

import java.util.UUID;

public interface DiscountRepository extends JpaRepository<Discount, UUID> {
}
