package secure_shop.backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import secure_shop.backend.entities.Brand;

public interface BrandRepository extends JpaRepository<Brand, Integer> {
}
