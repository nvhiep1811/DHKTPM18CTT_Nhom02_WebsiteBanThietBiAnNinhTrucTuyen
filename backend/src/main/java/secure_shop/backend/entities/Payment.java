package secure_shop.backend.entities;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import secure_shop.backend.enums.PaymentMethod;
import secure_shop.backend.enums.PaymentProvider;
import secure_shop.backend.enums.PaymentStatus;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@Entity
@Table(
        name = "payments",
        indexes = {
                @Index(name = "idx_payments_order", columnList = "order_id"),
                @Index(name = "idx_payments_status", columnList = "status"),
                @Index(name = "idx_payments_transaction_id", columnList = "transaction_id")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment extends BaseEntity {

    @NotNull(message = "Phương thức thanh toán không được để trống")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private PaymentMethod method;

    @NotNull(message = "Nhà cung cấp thanh toán không được để trống")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private PaymentProvider provider;

    @NotNull(message = "Trạng thái thanh toán không được để trống")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    @Builder.Default
    private PaymentStatus status = PaymentStatus.UNPAID;

    @NotNull(message = "Số tiền thanh toán không được để trống")
    @DecimalMin(value = "0.01", inclusive = true, message = "Số tiền thanh toán phải lớn hơn 0")
    @Digits(integer = 13, fraction = 2, message = "Số tiền không hợp lệ (tối đa 13 chữ số và 2 số thập phân)")
    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @Column(length = 255)
    private String transactionId;

    private Instant paidAt;

    // ✅ JSONB for payment gateway response
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    @Builder.Default
    private Map<String, Object> gatewayResponse = new HashMap<>();

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false, unique = true)
    private Order order;
}
