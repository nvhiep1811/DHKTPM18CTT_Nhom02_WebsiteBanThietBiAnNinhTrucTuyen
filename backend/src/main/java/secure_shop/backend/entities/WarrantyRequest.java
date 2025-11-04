package secure_shop.backend.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import secure_shop.backend.enums.WarrantyStatus;

import java.time.Instant;

@Entity
@Table(
        name = "warranty_requests",
        indexes = {
                @Index(name = "idx_warranty_order_item", columnList = "order_item_id"),
                @Index(name = "idx_warranty_status", columnList = "status"),
                @Index(name = "idx_warranty_requested_at", columnList = "requested_at")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WarrantyRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Loại sự cố không được để trống")
    @Size(max = 100, message = "Loại sự cố tối đa 100 ký tự")
    @Pattern(
            regexp = "^[\\p{L}0-9 .,'&\\-()!?]+$",
            message = "Loại sự cố chỉ được chứa chữ, số và các ký tự hợp lệ như . , ' & - ( ) ! ?"
    )
    @Column(nullable = false, length = 100)
    private String issueType;

    @Size(max = 2000, message = "Mô tả sự cố tối đa 2000 ký tự")
    @Column(columnDefinition = "TEXT")
    private String description;

    @NotNull(message = "Trạng thái yêu cầu bảo hành không được để trống")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    @Builder.Default
    private WarrantyStatus status = WarrantyStatus.SUBMITTED;

    @Builder.Default
    @Column(nullable = false)
    private Instant requestedAt = Instant.now();

    private Instant resolvedAt;

    @ManyToOne
    @JoinColumn(name = "order_item_id", nullable = false)
    private OrderItem orderItem;
}