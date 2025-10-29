package secure_shop.backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import secure_shop.backend.entities.Inventory;

public interface InventoryRepository extends JpaRepository<Inventory, Integer> {
}
