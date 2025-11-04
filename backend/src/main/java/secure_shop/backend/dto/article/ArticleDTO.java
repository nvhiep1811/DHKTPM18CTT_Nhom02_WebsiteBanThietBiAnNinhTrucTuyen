package secure_shop.backend.dto.article;

import lombok.*;

import java.io.Serializable;
import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ArticleDTO implements Serializable {
    private UUID id;
    private String title;
    private String slug;
    private String summary;
    private String content;
    private Instant publishedAt;
    private Boolean active;
    private String adminName;
}