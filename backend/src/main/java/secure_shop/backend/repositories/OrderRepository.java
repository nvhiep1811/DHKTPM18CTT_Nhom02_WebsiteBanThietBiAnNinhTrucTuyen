package secure_shop.backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import secure_shop.backend.entities.Order;

import java.util.UUID;

public interface OrderRepository extends JpaRepository<Order, UUID> {
}
