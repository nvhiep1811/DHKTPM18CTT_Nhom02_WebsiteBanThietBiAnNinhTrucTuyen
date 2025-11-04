package secure_shop.backend.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

@Entity
@Table(name = "media_assets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MediaAsset {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "URL ảnh không được để trống")
    @Size(max = 2048, message = "URL ảnh quá dài (tối đa 2048 ký tự)")
    @Pattern(
            regexp = "^(https?:\\/\\/)?([\\w\\-]+\\.)+[\\w\\-]+(\\/.*)?$",
            message = "Đường dẫn URL ảnh không hợp lệ"
    )
    @Column(nullable = false)
    private String url;

    @Size(max = 255, message = "Văn bản thay thế (alt text) tối đa 255 ký tự")
    @Pattern(
            regexp = "^[\\p{L}0-9 ,.\\-_'\"!?()]*$",
            message = "Văn bản thay thế chỉ được chứa chữ, số và ký tự hợp lệ"
    )
    private String altText;

    @ManyToOne(fetch = FetchType.LAZY, cascade = CascadeType.PERSIST)
    @JoinColumn(name = "product_id", nullable = false)
    @NotNull(message = "Ảnh phải thuộc về một sản phẩm")
    private Product product;
}
