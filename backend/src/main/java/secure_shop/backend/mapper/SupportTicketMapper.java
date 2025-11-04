package secure_shop.backend.mapper;

import secure_shop.backend.dto.ticket.SupportTicketDTO;
import secure_shop.backend.entities.SupportTicket;

public class SupportTicketMapper {
    public static SupportTicketDTO toDTO(SupportTicket t) {
        if (t == null) return null;
        return SupportTicketDTO.builder()
                .id(t.getId())
                .title(t.getTitle())
                .subject(t.getSubject())
                .content(t.getContent())
                .createdAt(t.getCreatedAt())
                .status(t.getStatus())
                .userId(t.getUser() != null ? t.getUser().getId() : null)
                .build();
    }
}