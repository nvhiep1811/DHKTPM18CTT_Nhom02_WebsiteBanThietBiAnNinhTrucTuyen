package secure_shop.backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import secure_shop.backend.entities.Order;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {

    /**
     * Tìm order theo userId với đầy đủ relationships
     */
    @Query("""
        SELECT DISTINCT o FROM Order o
        LEFT JOIN FETCH o.orderItems oi
        LEFT JOIN FETCH oi.product
        LEFT JOIN FETCH o.payment
        LEFT JOIN FETCH o.shipment
        LEFT JOIN FETCH o.discount
        LEFT JOIN FETCH o.user
        WHERE o.user.id = :userId
    """)
    List<Order> findByUserId(@Param("userId") UUID userId);

    /**
     * ✅ THÊM METHOD NÀY - Tìm order theo ID với đầy đủ relationships
     * Dùng cho việc gửi email confirmation
     */
    @Query("""
        SELECT DISTINCT o FROM Order o
        LEFT JOIN FETCH o.orderItems oi
        LEFT JOIN FETCH oi.product p
        LEFT JOIN FETCH o.user u
        LEFT JOIN FETCH o.payment
        LEFT JOIN FETCH o.shipment
        LEFT JOIN FETCH o.discount
        WHERE o.id = :orderId
    """)
    Optional<Order> findByIdWithDetails(@Param("orderId") UUID orderId);
}