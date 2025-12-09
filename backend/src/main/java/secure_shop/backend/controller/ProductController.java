package secure_shop.backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import secure_shop.backend.dto.product.ProductDTO;
import secure_shop.backend.dto.product.ProductDetailsDTO;
import secure_shop.backend.dto.product.ProductSummaryDTO;
import secure_shop.backend.service.ProductService;

import java.math.BigDecimal;
import java.util.UUID;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public ResponseEntity<Page<ProductSummaryDTO>> getProducts(
            @PageableDefault(size = 12) Pageable pageable,
            @RequestParam(required = false) Boolean active,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long brandId,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) Boolean inStock,
            @RequestParam(required = false) String keyword) {

        Page<ProductSummaryDTO> products = productService.filterProducts(
                active, categoryId, brandId, minPrice, maxPrice, inStock, keyword, pageable
        );
        return ResponseEntity.ok(products);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductDetailsDTO> getProductById(@PathVariable UUID id) {
        return ResponseEntity.ok(productService.getProductDetailsById(id));
    }

    @GetMapping("/summary/{id}")
    public ResponseEntity<ProductDTO> getProductSummary(@PathVariable UUID id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductDTO> createProduct(@Valid @RequestBody ProductDetailsDTO dto) {
        ProductDTO createdProduct = productService.createProduct(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdProduct);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductDTO> updateProduct(@PathVariable UUID id,@Valid @RequestBody ProductDetailsDTO dto) {
        return ResponseEntity.ok(productService.updateProduct(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteProduct(@PathVariable UUID id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/count")
    public ResponseEntity<Integer> getTotalProductsCount() {
        Integer count = productService.getTotalProductsCount();
        return ResponseEntity.ok(count);
    }
}

