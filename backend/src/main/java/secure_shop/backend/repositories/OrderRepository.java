package secure_shop.backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import secure_shop.backend.entities.Order;
import secure_shop.backend.enums.OrderStatus;
import secure_shop.backend.enums.PaymentStatus;

import java.math.BigDecimal;
import java.time.Instant;
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

    Integer countByDiscountIdAndUserId(UUID discountId, UUID userId);

    Integer countOrdersByCreatedAtIsNotNull();

    // Analytics queries
    @Query("SELECT COALESCE(SUM(o.grandTotal), 0) FROM Order o " +
            "WHERE o.paymentStatus = :paymentStatus " +
            "AND o.hasPaid = true " +
            "AND o.createdAt BETWEEN :startDate AND :endDate")
    BigDecimal calculateTotalRevenue(
            @Param("startDate") Instant startDate,
            @Param("endDate") Instant endDate,
            @Param("paymentStatus") PaymentStatus paymentStatus
    );

    @Query("SELECT COUNT(o) FROM Order o " +
            "WHERE o.status = :status " +
            "AND o.createdAt BETWEEN :startDate AND :endDate")
    Long countByStatusAndCreatedAtBetween(
            @Param("status") OrderStatus status,
            @Param("startDate") Instant startDate,
            @Param("endDate") Instant endDate
    );

    @Query("SELECT COUNT(o) FROM Order o " +
            "WHERE o.createdAt BETWEEN :startDate AND :endDate")
    Long countByCreatedAtBetween(
            @Param("startDate") Instant startDate,
            @Param("endDate") Instant endDate
    );

    @Query("SELECT COALESCE(AVG(o.grandTotal), 0) FROM Order o " +
            "WHERE o.status = :status " +
            "AND o.createdAt BETWEEN :startDate AND :endDate")
    BigDecimal calculateAvgOrderValue(
            @Param("status") OrderStatus status,
            @Param("startDate") Instant startDate,
            @Param("endDate") Instant endDate
    );

    /**
     * Get daily revenue and order count statistics
     * Returns: [date, totalRevenue, orderCount]
     */
    @Query("SELECT FUNCTION('DATE', o.createdAt), COALESCE(SUM(o.grandTotal), 0), COUNT(o) " +
            "FROM Order o " +
            "WHERE o.paymentStatus = :paymentStatus " +
            "AND o.hasPaid = true " +
            "AND o.createdAt BETWEEN :startDate AND :endDate " +
            "GROUP BY FUNCTION('DATE', o.createdAt) " +
            "ORDER BY FUNCTION('DATE', o.createdAt)")
    List<Object[]> getDailyRevenueStats(
            @Param("startDate") Instant startDate,
            @Param("endDate") Instant endDate,
            @Param("paymentStatus") PaymentStatus paymentStatus
    );
}
