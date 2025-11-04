package secure_shop.backend.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import secure_shop.backend.enums.TicketStatus;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "support_tickets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SupportTicket {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotBlank(message = "Tiêu đề không được để trống")
    @Size(max = 255, message = "Tiêu đề tối đa 255 ký tự")
    @Pattern(
            regexp = "^[\\p{L}0-9 .,'\"!?()\\-_:;]+$",
            message = "Tiêu đề chứa ký tự không hợp lệ"
    )
    @Column(nullable = false)
    private String title;

    @NotBlank(message = "Chủ đề không được để trống")
    @Size(max = 100, message = "Chủ đề tối đa 100 ký tự")
    @Pattern(
            regexp = "^[\\p{L}0-9 .,'\"!?()\\-_:;]+$",
            message = "Chủ đề chứa ký tự không hợp lệ"
    )
    @Column(nullable = false, length = 100)
    private String subject;

    @NotBlank(message = "Nội dung không được để trống")
    @Size(max = 5000, message = "Nội dung không được vượt quá 5000 ký tự")
    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private TicketStatus status = TicketStatus.OPEN;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @NotNull(message = "Phiếu hỗ trợ phải thuộc về một người dùng")
    private User user;
}
