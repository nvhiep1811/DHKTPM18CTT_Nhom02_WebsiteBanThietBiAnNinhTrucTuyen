package secure_shop.backend.entities;

import jakarta.persistence.*;
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

    @Column(nullable = false)
    private Integer onHand = 0;

    @Column(nullable = false)
    private Integer reserved = 0;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false, unique = true)
    private Product product;

    public void decreaseStock(int quantity) {
        this.onHand -= quantity;
    }

    public void increaseStock(int quantity) {
        this.onHand += quantity;
    }

    public void reserveStock(int quantity) {
        this.reserved += quantity;
    }

    public void releaseReservedStock(int quantity) {
        this.reserved -= quantity;
    }
}
