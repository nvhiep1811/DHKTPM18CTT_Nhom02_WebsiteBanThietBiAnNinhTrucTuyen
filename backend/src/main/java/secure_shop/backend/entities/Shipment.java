package secure_shop.backend.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.PastOrPresent;
import lombok.*;
import secure_shop.backend.enums.ShipmentStatus;

import javax.validation.constraints.*;
import java.time.Instant;

@Entity
@Table(name = "shipments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Shipment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Trạng thái vận chuyển không được để trống")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ShipmentStatus status = ShipmentStatus.PENDING;

    @PastOrPresent(message = "Thời gian vận chuyển không thể là tương lai")
    private Instant deliveredAt;

    @PastOrPresent(message = "Thời gian gửi không thể là tương lai")
    private Instant shippedAt;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false, unique = true)
    private Order order;
}
