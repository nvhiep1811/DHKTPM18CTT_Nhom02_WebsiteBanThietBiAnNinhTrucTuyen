package secure_shop.backend.repositories;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import secure_shop.backend.entities.Product;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProductRepository extends JpaRepository<Product, UUID> {
    Product findProductById(UUID id);

    @Query("SELECT p FROM Product p WHERE p.id = :id AND p.deletedAt IS NOT NULL")
    Optional<Product> findDeletedById(@Param("id") UUID id);

    @Query("""
    SELECT p FROM Product p
    WHERE (:active IS NULL OR p.active = :active)
      AND (:categoryId IS NULL OR p.category.id = :categoryId)
      AND (:brandId IS NULL OR p.brand.id = :brandId)
      AND (
            COALESCE(:keyword, '') = '' OR
            LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR
            LOWER(p.sku) LIKE LOWER(CONCAT('%', :keyword, '%')) OR
            LOWER(p.shortDesc) LIKE LOWER(CONCAT('%', :keyword, '%')) OR
            LOWER(p.longDesc) LIKE LOWER(CONCAT('%', :keyword, '%'))
          )
    """)
    Page<Product> filterProducts(@Param("active") Boolean active,
                                 @Param("categoryId") Long categoryId,
                                 @Param("brandId") Long brandId,
                                 @Param("keyword") String keyword,
                                 Pageable pageable);
}
