package secure_shop.backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import secure_shop.backend.entities.Product;

import java.util.UUID;

public interface ProductRepository extends JpaRepository<Product, UUID> {
}
