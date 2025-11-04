package secure_shop.backend.dto.ticket;

import lombok.*;
import java.time.Instant;
import java.util.UUID;
import secure_shop.backend.enums.TicketStatus;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SupportTicketDTO {
    private UUID id;
    private String title;
    private String subject;
    private String content;
    private Instant createdAt;
    private TicketStatus status;
    private UUID userId;
}