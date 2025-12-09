package secure_shop.backend.repositories;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import secure_shop.backend.entities.OrderItem;
import secure_shop.backend.enums.OrderStatus;
import secure_shop.backend.enums.PaymentStatus;

import java.time.Instant;
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

    /**
     * Find top selling products by total quantity sold within a date range
     * Returns: [productId, productName, thumbnailUrl, totalQuantity, totalRevenue]
     */
    @Query("SELECT p.id, p.name, p.thumbnailUrl, SUM(oi.quantity), SUM(oi.lineTotal) " +
            "FROM OrderItem oi " +
            "JOIN oi.product p " +
            "JOIN oi.order o " +
            "WHERE o.paymentStatus = :paymentStatus " +
            "AND o.hasPaid = true " +
            "AND o.createdAt BETWEEN :startDate AND :endDate " +
            "GROUP BY p.id, p.name, p.thumbnailUrl " +
            "ORDER BY SUM(oi.quantity) DESC")
    List<Object[]> findTopProductsBySales(
            @Param("startDate") Instant startDate,
            @Param("endDate") Instant endDate,
            @Param("paymentStatus") PaymentStatus paymentStatus,
            Pageable pageable
    );
}