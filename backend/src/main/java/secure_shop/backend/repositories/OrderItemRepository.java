package secure_shop.backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import secure_shop.backend.entities.OrderItem;
import secure_shop.backend.entities.OrderItemId;

import java.util.Optional;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, OrderItemId> {
    Optional<OrderItem> findById(long id);

    Boolean existsById(Long id);

    void deleteById(Long id);
}
