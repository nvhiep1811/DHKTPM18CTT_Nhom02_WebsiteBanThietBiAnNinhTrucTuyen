package secure_shop.backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import secure_shop.backend.entities.Category;

public interface CategoryRepository extends JpaRepository<Category, Integer> {
}
