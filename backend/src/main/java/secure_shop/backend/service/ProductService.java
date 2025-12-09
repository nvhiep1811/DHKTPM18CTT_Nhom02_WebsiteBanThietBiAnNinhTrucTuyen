package secure_shop.backend.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import secure_shop.backend.dto.product.ProductDTO;
import secure_shop.backend.dto.product.ProductDetailsDTO;
import secure_shop.backend.dto.product.ProductSummaryDTO;

import java.math.BigDecimal;
import java.util.UUID;

public interface ProductService {
    ProductDTO getProductById(UUID id);

    ProductDetailsDTO getProductDetailsById(UUID id);

    ProductDTO createProduct(ProductDetailsDTO dto);

    ProductDTO updateProduct(UUID id, ProductDetailsDTO dto);

    Boolean existsById(UUID id);

    Boolean deleteProduct(UUID id);

    Page<ProductSummaryDTO> filterProducts(Boolean active,
                                           Long categoryId,
                                           Long brandId,
                                           BigDecimal minPrice,
                                           BigDecimal maxPrice,
                                           Boolean inStock,
                                           String keyword,
                                           Pageable pageable);

    Integer getTotalProductsCount();
}
