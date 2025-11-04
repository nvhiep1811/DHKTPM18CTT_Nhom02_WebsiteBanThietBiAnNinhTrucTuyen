package secure_shop.backend.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "brands")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Brand {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Tên thương hiệu không được để trống")
    @Size(max = 100, message = "Tên thương hiệu tối đa 100 ký tự")
    @Pattern(
            regexp = "^[\\p{L}0-9 .,'&\\-()]+$",
            message = "Tên thương hiệu chỉ được chứa chữ cái, số và các ký tự hợp lệ như . , ' & - ( )"
    )
    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @OneToMany(mappedBy = "brand", cascade = CascadeType.ALL, orphanRemoval = false)
    @Builder.Default
    private Set<Product> products = new HashSet<>();
}
