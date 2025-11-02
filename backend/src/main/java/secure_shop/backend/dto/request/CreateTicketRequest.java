package secure_shop.backend.dto.request;

import lombok.Data;

@Data
public class CreateTicketRequest {
    private String title;
    private String subject;
    private String content;
}