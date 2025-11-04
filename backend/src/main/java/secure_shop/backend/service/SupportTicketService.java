package secure_shop.backend.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import secure_shop.backend.dto.ticket.SupportTicketDTO;
import secure_shop.backend.dto.ticket.request.CreateTicketRequest;
import secure_shop.backend.enums.TicketStatus;

import java.util.UUID;

public interface SupportTicketService {
    Page<SupportTicketDTO> getMyTickets(UUID userId, Pageable pageable);
    SupportTicketDTO createTicket(UUID userId, CreateTicketRequest req);
    SupportTicketDTO getTicket(UUID userId, UUID id);
    SupportTicketDTO closeTicket(UUID userId, UUID id);
    Page<SupportTicketDTO> getAllTickets(Pageable pageable);
    SupportTicketDTO updateStatus(UUID id, TicketStatus status);
}
