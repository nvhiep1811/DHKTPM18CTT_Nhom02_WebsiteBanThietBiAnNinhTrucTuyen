package secure_shop.backend.repositories;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import secure_shop.backend.dto.product.ProductSummaryDTO;
import secure_shop.backend.entities.Product;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProductRepository extends JpaRepository<Product, UUID> {
    Product findProductById(UUID id);

    @Query("""
        SELECT p FROM Product p
        LEFT JOIN FETCH p.brand
        LEFT JOIN FETCH p.category
        LEFT JOIN FETCH p.mediaAssets
        LEFT JOIN FETCH p.inventory
        WHERE p.id = :id
    """)
    Optional<Product> findByIdWithRelations(@Param("id") UUID id);

    @Query("SELECT p FROM Product p WHERE p.id = :id AND p.deletedAt IS NOT NULL")
    Optional<Product> findDeletedById(@Param("id") UUID id);

    @Query("""
    SELECT new secure_shop.backend.dto.product.ProductSummaryDTO(
        p.id,
        p.sku,
        p.name,
        p.listedPrice,
        p.price,
        p.thumbnailUrl,
        i.onHand - i.reserved,
        (CASE WHEN i.onHand - i.reserved > 0 THEN true ELSE false END),
        new secure_shop.backend.dto.product.CategorySummaryDTO(c.id, c.name, c.imageUrl, c.description, c.active),
        new secure_shop.backend.dto.product.BrandDTO(b.id, b.name),
        p.rating,
        p.reviewCount
    )
    FROM Product p
    LEFT JOIN p.category c
    LEFT JOIN p.brand b
    LEFT JOIN p.inventory i
    WHERE p.deletedAt IS NULL
      AND (:active IS NULL OR p.active = :active)
      AND (:categoryId IS NULL OR c.id = :categoryId)
      AND (:brandId IS NULL OR b.id = :brandId)
      AND (:minPrice IS NULL OR p.price >= :minPrice)
      AND (:maxPrice IS NULL OR p.price <= :maxPrice)
      AND (:inStock IS NULL OR 
           (CASE WHEN :inStock = true THEN (i.onHand - i.reserved) > 0 
                 ELSE (i.onHand - i.reserved) <= 0 
           END))
      AND LOWER(p.name) LIKE LOWER(CONCAT('%', COALESCE(:keyword, ''), '%'))
    """)
    Page<ProductSummaryDTO> filterProducts(Boolean active,
                                           Long categoryId,
                                           Long brandId,
                                           BigDecimal minPrice,
                                           BigDecimal maxPrice,
                                           Boolean inStock,
                                           String keyword,
                                           Pageable pageable);
}
