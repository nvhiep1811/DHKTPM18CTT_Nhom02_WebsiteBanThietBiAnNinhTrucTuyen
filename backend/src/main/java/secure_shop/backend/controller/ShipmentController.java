package secure_shop.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import secure_shop.backend.dto.order.ShipmentDTO;
import secure_shop.backend.service.ShipmentService;

import java.util.UUID;

@RestController
@RequestMapping("/api/shipments")
@RequiredArgsConstructor
public class ShipmentController {

    private final ShipmentService shipmentService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<ShipmentDTO>> getAllShipments(Pageable pageable) {
        return ResponseEntity.ok(shipmentService.getShipmentsPage(pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ShipmentDTO> getShipmentById(@PathVariable Long id) {
        return ResponseEntity.ok(shipmentService.getShipmentById(id));
    }

    @GetMapping("/order/{orderId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ShipmentDTO> getShipmentByOrderId(@PathVariable UUID orderId) {
        return ResponseEntity.ok(shipmentService.getShipmentByOrderId(orderId));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ShipmentDTO> createShipment(@RequestBody ShipmentDTO dto) {
        return ResponseEntity.ok(shipmentService.createShipment(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ShipmentDTO> updateShipment(@PathVariable Long id, @RequestBody ShipmentDTO dto) {
        return ResponseEntity.ok(shipmentService.updateShipment(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteShipment(@PathVariable Long id) {
        shipmentService.deleteShipment(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/mark-shipped")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ShipmentDTO> markAsShipped(@PathVariable Long id) {
        return ResponseEntity.ok(shipmentService.markAsShipped(id));
    }

    @PatchMapping("/{id}/mark-delivered")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ShipmentDTO> markAsDelivered(@PathVariable Long id) {
        return ResponseEntity.ok(shipmentService.markAsDelivered(id));
    }
}

