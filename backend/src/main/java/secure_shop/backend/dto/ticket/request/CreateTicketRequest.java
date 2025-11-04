package secure_shop.backend.dto.ticket.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateTicketRequest {
    @NotBlank(message = "Tiêu đề không được để trống")
    @Size(max = 255, message = "Tiêu đề tối đa 255 ký tự")
    @Pattern(
            regexp = "^[\\p{L}0-9 .,'\"!?()\\-_:;]+$",
            message = "Tiêu đề chứa ký tự không hợp lệ"
    )
    private String title;

    @NotBlank(message = "Chủ đề không được để trống")
    @Size(max = 100, message = "Chủ đề tối đa 100 ký tự")
    @Pattern(
            regexp = "^[\\p{L}0-9 .,'\"!?()\\-_:;]+$",
            message = "Chủ đề chứa ký tự không hợp lệ"
    )
    private String subject;

    @NotBlank(message = "Nội dung không được để trống")
    @Size(max = 5000, message = "Nội dung không được vượt quá 5000 ký tự")
    private String content;
}