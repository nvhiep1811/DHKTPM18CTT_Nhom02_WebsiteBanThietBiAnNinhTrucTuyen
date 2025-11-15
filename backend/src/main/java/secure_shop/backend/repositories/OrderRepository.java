package secure_shop.backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import secure_shop.backend.entities.Order;

import java.util.List;
import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {

    @Query("""
    SELECT DISTINCT o FROM Order o
    LEFT JOIN FETCH o.orderItems
    LEFT JOIN FETCH o.payment
    LEFT JOIN FETCH o.shipment
    LEFT JOIN FETCH o.discount
    WHERE o.user.id = :userId
""")
    List<Order> findByUserId(@Param("userId") UUID userId);
}
