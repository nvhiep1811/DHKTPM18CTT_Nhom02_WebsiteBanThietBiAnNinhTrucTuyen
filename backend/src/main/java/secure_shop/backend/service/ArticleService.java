package secure_shop.backend.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import secure_shop.backend.dto.article.ArticleDTO;
import secure_shop.backend.dto.article.request.CreateArticleRequest;
import secure_shop.backend.dto.article.request.UpdateArticleRequest;
import secure_shop.backend.entities.User;

import java.util.UUID;

public interface ArticleService {
    Page<ArticleDTO> getAllArticles(Pageable pageable, Boolean active);
    ArticleDTO getArticleBySlug(String slug);
    ArticleDTO createArticle(CreateArticleRequest req, User admin);
    ArticleDTO updateArticle(UUID id, UpdateArticleRequest req, User admin);
    void deleteArticle(UUID id);
}