package secure_shop.backend.dto.article.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateArticleRequest {
    @NotBlank(message = "Tiêu đề bài viết không được để trống")
    @Size(max = 255, message = "Tiêu đề bài viết tối đa 255 ký tự")
    private String title;

    @NotBlank(message = "Slug không được để trống")
    @Pattern(
            regexp = "^[a-z0-9]+(?:-[a-z0-9]+)*$",
            message = "Slug chỉ được chứa chữ thường, số và dấu gạch nối (-)"
    )
    @Size(max = 255, message = "Slug tối đa 255 ký tự")
    private String slug;

    @Size(max = 1000, message = "Tóm tắt tối đa 1000 ký tự")
    private String summary;

    @NotBlank(message = "Nội dung bài viết không được để trống")
    @Size(min = 20, message = "Nội dung bài viết phải có ít nhất 20 ký tự")
    private String content;

    private Boolean active;
}
