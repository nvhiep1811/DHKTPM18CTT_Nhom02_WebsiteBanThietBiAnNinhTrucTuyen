package secure_shop.backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import secure_shop.backend.entities.Review;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
}
