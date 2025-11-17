package secure_shop.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import secure_shop.backend.dto.discount.DiscountDTO;
import secure_shop.backend.dto.discount.DiscountDetailsDTO;
import secure_shop.backend.service.DiscountService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/discounts")
@RequiredArgsConstructor
public class DiscountController {

    private final DiscountService discountService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<DiscountDTO>> getDiscounts(Pageable pageable) {
        return ResponseEntity.ok(discountService.getDiscountsPage(pageable));
    }

    @GetMapping("/active")
    public ResponseEntity<List<DiscountDTO>> getActiveDiscounts() {
        return ResponseEntity.ok(discountService.getActiveDiscounts());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DiscountDetailsDTO> getDiscountById(@PathVariable UUID id) {
        return ResponseEntity.ok(discountService.getDiscountDetailsById(id));
    }

    @GetMapping("/code/{code}")
    public ResponseEntity<DiscountDetailsDTO> getDiscountByCode(@PathVariable String code) {
        return ResponseEntity.ok(discountService.applyDiscountCode(code));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DiscountDTO> createDiscount(@RequestBody DiscountDTO dto) {
        return ResponseEntity.ok(discountService.createDiscount(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DiscountDTO> updateDiscount(@PathVariable UUID id, @RequestBody DiscountDTO dto) {
        return ResponseEntity.ok(discountService.updateDiscount(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteDiscount(@PathVariable UUID id) {
        discountService.deleteDiscount(id);
        return ResponseEntity.noContent().build();
    }
}

