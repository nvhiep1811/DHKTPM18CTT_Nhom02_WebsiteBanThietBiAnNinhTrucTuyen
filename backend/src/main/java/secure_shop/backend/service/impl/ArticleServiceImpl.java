package secure_shop.backend.service.impl;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import secure_shop.backend.dto.article.ArticleDTO;
import secure_shop.backend.dto.article.request.CreateArticleRequest;
import secure_shop.backend.dto.article.request.UpdateArticleRequest;
import secure_shop.backend.entities.Article;
import secure_shop.backend.entities.User;
import secure_shop.backend.mapper.ArticleMapper;
import secure_shop.backend.repositories.ArticleRepository;
import secure_shop.backend.service.ArticleService;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class ArticleServiceImpl implements ArticleService {

    private final ArticleRepository articleRepository;
    private final ArticleMapper articleMapper;

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "articles_active", key = "#pageable.pageNumber + '-' + #pageable.pageSize")
    public Page<ArticleDTO> getAllArticles(Pageable pageable, Boolean active) {
        Specification<Article> spec = (root, query, cb) -> cb.conjunction();

        if (active != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("active"), active));
        }

        Page<Article> page = articleRepository.findAll(spec, pageable);
        return page.map(articleMapper::toDTO);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "article_by_slug", key = "#slug")
    public ArticleDTO getArticleBySlug(String slug) {
        Article article = articleRepository.findBySlug(slug)
                .orElseThrow(() -> new EntityNotFoundException("Article not found"));
        return articleMapper.toDTO(article);
    }

    @Override
    @CacheEvict(value = "articles_active", allEntries = true)
    public ArticleDTO createArticle(CreateArticleRequest req, User admin) {
        Article article = articleMapper.fromCreateRequest(req, admin);
        Article saved = articleRepository.save(article);
        return articleMapper.toDTO(saved);
    }

    @Override
    @CacheEvict(value = {"article_by_slug", "articles_active"}, allEntries = true)
    public ArticleDTO updateArticle(UUID id, UpdateArticleRequest req, User admin) {
        Article article = articleRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Article not found"));
        if (!article.getAdmin().getId().equals(admin.getId()))
            throw new AccessDeniedException("Not authorized");

        article.setTitle(req.getTitle());
        article.setSummary(req.getSummary());
        article.setContent(req.getContent());
        article.setActive(req.getActive());
        return articleMapper.toDTO(articleRepository.save(article));
    }

    @Override
    @CacheEvict(value = {"article_by_slug", "articles_active"}, allEntries = true)
    public void deleteArticle(UUID id) {
        articleRepository.deleteById(id);
    }
}