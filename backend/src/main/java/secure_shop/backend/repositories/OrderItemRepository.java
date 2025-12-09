package secure_shop.backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import secure_shop.backend.entities.OrderItem;
import secure_shop.backend.enums.OrderStatus;

import java.util.List;
import java.util.UUID;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    /**
     * Find all order items for a user and product with a specific order status
     * Used to validate if user can review a product (must have completed purchase)
     */
    @Query("SELECT oi FROM OrderItem oi " +
            "WHERE oi.order.user.id = :userId " +
            "AND oi.product.id = :productId " +
            "AND oi.order.status = :orderStatus")
    List<OrderItem> findByUserAndProductAndOrderStatus(
            @Param("userId") UUID userId,
            @Param("productId") UUID productId,
            @Param("orderStatus") OrderStatus orderStatus
    );
}