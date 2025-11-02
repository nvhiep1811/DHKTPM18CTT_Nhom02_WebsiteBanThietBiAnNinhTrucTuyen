package secure_shop.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import secure_shop.backend.config.security.CustomUserDetails;
import secure_shop.backend.dto.ArticleDTO;
import secure_shop.backend.dto.request.CreateArticleRequest;
import secure_shop.backend.dto.request.UpdateArticleRequest;
import secure_shop.backend.entities.User;
import secure_shop.backend.repositories.UserRepository;
import secure_shop.backend.service.ArticleService;

import java.util.UUID;

@RestController
@RequestMapping("/api/articles")
@RequiredArgsConstructor
public class ArticleController {

    private final ArticleService articleService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<Page<ArticleDTO>> getArticles(
            Pageable pageable,
            @RequestParam(required = false) Boolean active) {
        return ResponseEntity.ok(articleService.getAllArticles(pageable, active));
    }

    @GetMapping("/{slug}")
    public ResponseEntity<ArticleDTO> getArticle(@PathVariable String slug) {
        return ResponseEntity.ok(articleService.getArticleBySlug(slug));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ArticleDTO> createArticle(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody CreateArticleRequest req) {
        User admin = userRepository.findById(userDetails.getUser().getId())
                .orElseThrow(() -> new RuntimeException("Admin not found"));
        return ResponseEntity.ok(articleService.createArticle(req, admin));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ArticleDTO> updateArticle(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable UUID id,
            @RequestBody UpdateArticleRequest req) {
        User admin = userRepository.findById(userDetails.getUser().getId())
                .orElseThrow(() -> new RuntimeException("Admin not found"));
        return ResponseEntity.ok(articleService.updateArticle(id, req, admin));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteArticle(@PathVariable UUID id) {
        articleService.deleteArticle(id);
        return ResponseEntity.noContent().build();
    }
}