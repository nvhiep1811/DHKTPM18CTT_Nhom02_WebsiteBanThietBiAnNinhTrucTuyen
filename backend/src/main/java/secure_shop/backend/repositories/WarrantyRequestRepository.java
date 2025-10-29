package secure_shop.backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import secure_shop.backend.entities.WarrantyRequest;

public interface WarrantyRequestRepository extends JpaRepository<WarrantyRequest, Integer> {
}
