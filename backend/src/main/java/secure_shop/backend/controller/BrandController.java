package secure_shop.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import secure_shop.backend.dto.product.BrandDTO;
import secure_shop.backend.service.BrandService;

@RestController
@RequestMapping("/api/brands")
@RequiredArgsConstructor
public class BrandController {

    private final BrandService brandService;

    @GetMapping
    public ResponseEntity<Page<BrandDTO>> getBrands(Pageable pageable) {
        return ResponseEntity.ok(brandService.getAllBrands(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BrandDTO> getBrand(@PathVariable Long id) {
        return ResponseEntity.ok(brandService.getBrandById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BrandDTO> createBrand(@RequestBody BrandDTO dto) {
        return ResponseEntity.ok(brandService.createBrand(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BrandDTO> updateBrand(@PathVariable Long id, @RequestBody BrandDTO dto) {
        return ResponseEntity.ok(brandService.updateBrand(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteBrand(@PathVariable Long id) {
        brandService.deleteBrand(id);
        return ResponseEntity.noContent().build();
    }
}
