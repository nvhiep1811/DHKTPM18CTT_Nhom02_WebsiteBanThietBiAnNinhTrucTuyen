package secure_shop.backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import secure_shop.backend.entities.Inventory;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, Integer> {
    Optional<Inventory> findByProductId(UUID productId);

    @Modifying
    @Query("UPDATE Inventory i SET i.reserved = i.reserved + :qty " +
            "WHERE i.id = :id AND (i.onHand - i.reserved) >= :qty")
    int reserveStockAtomic(@Param("id") Long id, @Param("qty") int qty);

    @Modifying
    @Query("UPDATE Inventory i SET i.reserved = i.reserved - :qty " +
            "WHERE i.id = :id AND i.reserved >= :qty")
    int releaseStockAtomic(@Param("id") Long id, @Param("qty") int qty);

    @Modifying
    @Query("UPDATE Inventory i SET i.onHand = i.onHand - :qty, i.reserved = i.reserved - :qty " +
            "WHERE i.id = :id AND i.reserved >= :qty AND i.onHand >= :qty")
    int consumeReservedStock(@Param("id") Long id, @Param("qty") int qty);
}
