package secure_shop.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import secure_shop.backend.dto.product.InventoryDTO;
import secure_shop.backend.service.InventoryService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/inventories")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;

    @GetMapping
    public ResponseEntity<List<InventoryDTO>> getAllInventories() {
        List<InventoryDTO> inventories = inventoryService.getAllInventories();
        return ResponseEntity.ok(inventories);
    }

    @GetMapping("/{productId}")
    public ResponseEntity<InventoryDTO> getByProductId(@PathVariable UUID productId) {
        InventoryDTO dto = inventoryService.getByProductId(productId);
        return ResponseEntity.ok(dto);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<InventoryDTO> createInventory(
            @RequestParam UUID productId,
            @RequestParam(defaultValue = "0") int onHand) {

        InventoryDTO created = inventoryService.createInventory(productId, onHand);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PatchMapping("/{productId}/update-stock")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<InventoryDTO> updateStock(
            @PathVariable UUID productId,
            @RequestParam int quantityChange) {

        InventoryDTO updated = inventoryService.updateStock(productId, quantityChange);
        return ResponseEntity.ok(updated);
    }
}