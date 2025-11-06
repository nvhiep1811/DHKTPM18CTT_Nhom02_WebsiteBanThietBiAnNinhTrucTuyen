package secure_shop.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import secure_shop.backend.config.security.CustomUserDetails;
import secure_shop.backend.dto.ticket.WarrantyRequestDTO;
import secure_shop.backend.service.WarrantyRequestService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/warranty-requests")
@RequiredArgsConstructor
public class WarrantyRequestController {

    private final WarrantyRequestService warrantyRequestService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<WarrantyRequestDTO>> getAllWarrantyRequests(Pageable pageable) {
        return ResponseEntity.ok(warrantyRequestService.getWarrantyRequestsPage(pageable));
    }

    @GetMapping("/user/my")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<WarrantyRequestDTO>> getMyWarrantyRequests(Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        return ResponseEntity.ok(warrantyRequestService.getWarrantyRequestsByUserId(userId));
    }

    @GetMapping("/{id}")
    @PreAuthorize("@securityService.canAccessWarrantyRequest(#id, authentication)")
    public ResponseEntity<WarrantyRequestDTO> getWarrantyRequestById(@PathVariable Long id) {
        return ResponseEntity.ok(warrantyRequestService.getWarrantyRequestById(id));
    }

    @GetMapping("/order-item/{orderItemId}")
    @PreAuthorize("@securityService.canAccessOrderItem(#orderItemId, authentication)")
    public ResponseEntity<List<WarrantyRequestDTO>> getWarrantyRequestsByOrderItem(@PathVariable Long orderItemId) {
        return ResponseEntity.ok(warrantyRequestService.getWarrantyRequestsByOrderItemId(orderItemId));
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<WarrantyRequestDTO> createWarrantyRequest(@RequestBody WarrantyRequestDTO dto) {
        WarrantyRequestDTO saved = warrantyRequestService.createWarrantyRequest(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    @PreAuthorize("@securityService.canAccessWarrantyRequest(#id, authentication)")
    public ResponseEntity<WarrantyRequestDTO> updateWarrantyRequest(@PathVariable Long id, @RequestBody WarrantyRequestDTO dto) {
        return ResponseEntity.ok(warrantyRequestService.updateWarrantyRequest(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteWarrantyRequest(@PathVariable Long id) {
        warrantyRequestService.deleteWarrantyRequest(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/approve/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<WarrantyRequestDTO> approveWarrantyRequest(@PathVariable Long id) {
        return ResponseEntity.ok(warrantyRequestService.approveWarrantyRequest(id));
    }

    @PatchMapping("/reject/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<WarrantyRequestDTO> rejectWarrantyRequest(@PathVariable Long id) {
        return ResponseEntity.ok(warrantyRequestService.rejectWarrantyRequest(id));
    }

    @PatchMapping("/resolve/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<WarrantyRequestDTO> resolveWarrantyRequest(@PathVariable Long id) {
        return ResponseEntity.ok(warrantyRequestService.resolveWarrantyRequest(id));
    }
}

