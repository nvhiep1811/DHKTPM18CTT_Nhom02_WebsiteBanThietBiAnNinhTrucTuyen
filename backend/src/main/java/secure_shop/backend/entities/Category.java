package secure_shop.backend.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;
import java.time.Instant;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(
        name = "categories",
        indexes = {
                @Index(name = "idx_categories_name", columnList = "name")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Tên danh mục không được để trống")
    @Size(max = 255, message = "Tên danh mục tối đa 255 ký tự")
    @Pattern(
            regexp = "^[\\p{L}0-9 .,'&\\-()]+$",
            message = "Tên danh mục chỉ được chứa chữ cái, số và các ký tự hợp lệ như . , ' & - ( )"
    )
    @Column(nullable = false, unique = true, length = 255)
    private String name;

    @Size(max = 2000, message = "Mô tả danh mục tối đa 2000 ký tự")
    @Column(columnDefinition = "TEXT")
    private String description;

    @Size(max = 500, message = "Đường dẫn ảnh quá dài (tối đa 500 ký tự)")
    @Pattern(
            regexp = "^(https?:\\/\\/)?([\\w\\-]+\\.)+[\\w\\-]+(\\/.*)?$",
            message = "URL ảnh danh mục không hợp lệ"
    )
    @Column(length = 500)
    private String imageUrl;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    @NotNull(message = "Trạng thái danh mục không được để trống")
    @Builder.Default
    @Column(nullable = false)
    private Boolean active = true;

    @OneToMany(mappedBy = "category", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    @Builder.Default
    private Set<Product> products = new HashSet<>();

    @PrePersist
    public void prePersist() {
        Instant now = Instant.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = Instant.now();
    }
}