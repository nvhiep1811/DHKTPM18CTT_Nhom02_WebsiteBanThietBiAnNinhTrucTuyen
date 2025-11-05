package secure_shop.backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import secure_shop.backend.entities.WarrantyRequest;

import java.util.List;
import java.util.UUID;

@Repository
public interface WarrantyRequestRepository extends JpaRepository<WarrantyRequest, Long> {

    @Query("SELECT wr FROM WarrantyRequest wr " +
           "JOIN wr.orderItem oi " +
           "JOIN oi.order o " +
           "WHERE o.user.id = :userId")
    List<WarrantyRequest> findByUserId(@Param("userId") UUID userId);

    List<WarrantyRequest> findByOrderItemId(Long orderItemId);
}
