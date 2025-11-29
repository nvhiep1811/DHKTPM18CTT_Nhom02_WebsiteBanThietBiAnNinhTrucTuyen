package secure_shop.backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import secure_shop.backend.entities.OrderItem;
import secure_shop.backend.enums.OrderStatus;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    // Existing methods
    Optional<OrderItem> findById(Long id);

    boolean existsById(Long id);

    void deleteById(Long id);

    /**
     * Find order items for a specific user and product with a given order status
     * Used to verify if a user has purchased and received a product before allowing review
     *
     * @param userId The ID of the user
     * @param productId The ID of the product
     * @param orderStatus The status of the order (e.g., DELIVERED)
     * @return List of order items matching the criteria
     */
//    @Query("SELECT oi FROM OrderItem oi " +
//            "JOIN oi.order o " +
//            "WHERE o.user.id = :userId " +
//            "AND oi.productSnapshot.id = :productId " +
//            "AND o.status = :orderStatus")
//    List<OrderItem> findByUserAndProductAndOrderStatus(
//            @Param("userId") UUID userId,
//            @Param("productId") UUID productId,
//            @Param("orderStatus") OrderStatus orderStatus
//    );

    @Query("SELECT oi FROM OrderItem oi " +
            "JOIN oi.order o " +
            "WHERE o.user.id = :userId " +
            "AND oi.product.id = :productId " +
            "AND o.status = :orderStatus")
    List<OrderItem> findByUserAndProductAndOrderStatus(
            @Param("userId") UUID userId,
            @Param("productId") UUID productId,
            @Param("orderStatus") OrderStatus orderStatus
    );
}