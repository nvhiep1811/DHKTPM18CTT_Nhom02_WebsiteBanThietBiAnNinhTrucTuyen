package secure_shop.backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import secure_shop.backend.entities.Review;

public interface ReviewRepository extends JpaRepository<Review, Integer> {
}
