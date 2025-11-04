package secure_shop.backend.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "articles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Article {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotBlank(message = "Tiêu đề bài viết không được để trống")
    @Size(max = 255, message = "Tiêu đề bài viết tối đa 255 ký tự")
    @Column(nullable = false)
    private String title;

    @NotBlank(message = "Slug không được để trống")
    @Pattern(
            regexp = "^[a-z0-9]+(?:-[a-z0-9]+)*$",
            message = "Slug chỉ được chứa chữ thường, số và dấu gạch nối (-)"
    )
    @Size(max = 255, message = "Slug tối đa 255 ký tự")
    @Column(nullable = false, unique = true)
    private String slug;

    @Size(max = 1000, message = "Tóm tắt tối đa 1000 ký tự")
    @Column(columnDefinition = "TEXT")
    private String summary;

    @NotBlank(message = "Nội dung bài viết không được để trống")
    @Size(min = 20, message = "Nội dung bài viết phải có ít nhất 20 ký tự")
    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @PastOrPresent(message = "Thời điểm xuất bản không hợp lệ")
    @Column(nullable = false, updatable = false)
    private Instant publishedAt;

    @NotNull(message = "Trạng thái bài viết không được để trống")
    @Column(nullable = false)
    private Boolean active = true;

    @NotNull(message = "Bài viết phải có người tạo (admin)")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_id", nullable = false)
    private User admin;

    @PrePersist
    public void onCreate() {
        if (publishedAt == null) {
            publishedAt = Instant.now();
        }
    }
}
