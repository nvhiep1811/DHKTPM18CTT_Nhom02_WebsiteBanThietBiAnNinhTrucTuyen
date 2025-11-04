package secure_shop.backend.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import secure_shop.backend.dto.ticket.SupportTicketDTO;
import secure_shop.backend.dto.ticket.request.CreateTicketRequest;
import secure_shop.backend.entities.SupportTicket;
import secure_shop.backend.entities.User;
import secure_shop.backend.enums.TicketStatus;
import secure_shop.backend.mapper.SupportTicketMapper;
import secure_shop.backend.repositories.SupportTicketRepository;
import secure_shop.backend.repositories.UserRepository;
import secure_shop.backend.service.SupportTicketService;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class SupportTicketServiceImpl implements SupportTicketService {

    private final SupportTicketRepository repository;
    private final UserRepository userRepository;

    @Override
    public Page<SupportTicketDTO> getMyTickets(UUID userId, Pageable pageable) {
        return repository.findByUserId(userId, pageable)
                .map(SupportTicketMapper::toDTO);
    }

    @Override
    public SupportTicketDTO createTicket(UUID userId, CreateTicketRequest req) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        SupportTicket ticket = SupportTicket.builder()
                .title(req.getTitle())
                .subject(req.getSubject())
                .content(req.getContent())
                .user(user)
                .status(TicketStatus.OPEN)
                .build();

        return SupportTicketMapper.toDTO(repository.save(ticket));
    }

    @Override
    public SupportTicketDTO getTicket(UUID userId, UUID id) {
        SupportTicket t = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found"));

        if (!t.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("You are not allowed to access this ticket");
        }
        return SupportTicketMapper.toDTO(t);
    }

    @Override
    public SupportTicketDTO closeTicket(UUID userId, UUID id) {
        SupportTicket t = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found"));

        if (!t.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("You are not allowed to close this ticket");
        }

        t.setStatus(TicketStatus.CLOSED);
        return SupportTicketMapper.toDTO(repository.save(t));
    }

    @Override
    public Page<SupportTicketDTO> getAllTickets(Pageable pageable) {
        return repository.findAll(pageable)
                .map(SupportTicketMapper::toDTO);
    }

    @Override
    public SupportTicketDTO updateStatus(UUID id, TicketStatus status) {
        SupportTicket t = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found"));
        t.setStatus(status);
        return SupportTicketMapper.toDTO(repository.save(t));
    }
}