package secure_shop.backend.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Entity
@Table(name = "inventory")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Inventory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Số lượng tồn kho không được để trống")
    @Min(value = 0, message = "Số lượng tồn kho không được âm")
    @Column(nullable = false)
    private Integer onHand = 0;

    @NotNull(message = "Số lượng đang giữ chỗ không được để trống")
    @Min(value = 0, message = "Số lượng giữ chỗ không được âm")
    @Column(nullable = false)
    private Integer reserved = 0;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false, unique = true)
    private Product product;

    @AssertTrue(message = "Số lượng tồn kho (onHand) phải lớn hơn hoặc bằng số lượng đang giữ chỗ (reserved)")
    public boolean isStockValid() {
        if (onHand == null || reserved == null) return true;
        return onHand >= reserved;
    }

    public void decreaseStock(int quantity) {
        if (quantity <= 0) {
            throw new IllegalArgumentException("Số lượng trừ phải lớn hơn 0");
        }
        if (this.onHand < quantity) {
            throw new IllegalStateException("Không đủ hàng tồn kho để trừ");
        }
        this.onHand -= quantity;
    }

    public void increaseStock(int quantity) {
        if (quantity <= 0) {
            throw new IllegalArgumentException("Số lượng nhập phải lớn hơn 0");
        }
        this.onHand += quantity;
    }

    public void reserveStock(int quantity) {
        if (quantity <= 0) {
            throw new IllegalArgumentException("Số lượng đặt giữ phải lớn hơn 0");
        }
        if (this.onHand - this.reserved < quantity) {
            throw new IllegalStateException("Không đủ hàng tồn kho để giữ chỗ");
        }
        this.reserved += quantity;
    }

    public void releaseReservedStock(int quantity) {
        if (quantity <= 0) {
            throw new IllegalArgumentException("Số lượng hủy giữ chỗ phải lớn hơn 0");
        }
        if (this.reserved < quantity) {
            throw new IllegalStateException("Số lượng hủy giữ chỗ vượt quá số lượng đang giữ");
        }
        this.reserved -= quantity;
    }
}
