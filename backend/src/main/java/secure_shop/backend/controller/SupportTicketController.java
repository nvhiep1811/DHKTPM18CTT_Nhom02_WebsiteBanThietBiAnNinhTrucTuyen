package secure_shop.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import secure_shop.backend.dto.ticket.SupportTicketDTO;
import secure_shop.backend.config.security.CustomUserDetails;
import secure_shop.backend.dto.ticket.request.CreateTicketRequest;
import secure_shop.backend.enums.TicketStatus;
import secure_shop.backend.service.SupportTicketService;

import java.util.UUID;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class SupportTicketController {

    private final SupportTicketService supportTicketService;

    // === User endpoints ===
    @GetMapping
    public ResponseEntity<Page<SupportTicketDTO>> getMyTickets(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            Pageable pageable) {
        return ResponseEntity.ok(supportTicketService.getMyTickets(userDetails.getUser().getId(), pageable));
    }

    @PostMapping
    public ResponseEntity<SupportTicketDTO> createTicket(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody CreateTicketRequest req) {
        return ResponseEntity.ok(supportTicketService.createTicket(userDetails.getUser().getId(), req));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SupportTicketDTO> getTicket(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable UUID id) {
        return ResponseEntity.ok(supportTicketService.getTicket(userDetails.getUser().getId(), id));
    }

    @PutMapping("/{id}/close")
    public ResponseEntity<SupportTicketDTO> closeTicket(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable UUID id) {
        return ResponseEntity.ok(supportTicketService.closeTicket(userDetails.getUser().getId(), id));
    }

    // === Admin endpoints ===
    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<SupportTicketDTO>> getAllTickets(Pageable pageable) {
        return ResponseEntity.ok(supportTicketService.getAllTickets(pageable));
    }

    @PutMapping("/admin/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SupportTicketDTO> updateTicketStatus(
            @PathVariable UUID id,
            @RequestParam TicketStatus status) {
        return ResponseEntity.ok(supportTicketService.updateStatus(id, status));
    }
}