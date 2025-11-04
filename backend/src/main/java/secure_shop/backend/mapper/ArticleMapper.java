package secure_shop.backend.mapper;

import org.springframework.stereotype.Component;
import secure_shop.backend.dto.article.ArticleDTO;
import secure_shop.backend.dto.article.request.CreateArticleRequest;
import secure_shop.backend.entities.Article;
import secure_shop.backend.entities.User;

@Component
public class ArticleMapper {

    public ArticleDTO toDTO(Article article) {
        return ArticleDTO.builder()
                .id(article.getId())
                .title(article.getTitle())
                .slug(article.getSlug())
                .summary(article.getSummary())
                .content(article.getContent())
                .publishedAt(article.getPublishedAt())
                .active(article.getActive())
                .adminName(article.getAdmin() != null ? article.getAdmin().getName() : null)
                .build();
    }

    public Article fromCreateRequest(CreateArticleRequest req, User admin) {
        return Article.builder()
                .title(req.getTitle())
                .slug(generateSlug(req.getTitle()))
                .summary(req.getSummary())
                .content(req.getContent())
                .admin(admin)
                .active(true)
                .build();
    }

    private String generateSlug(String title) {
        return title.toLowerCase().replaceAll("[^a-z0-9]+", "-");
    }
}