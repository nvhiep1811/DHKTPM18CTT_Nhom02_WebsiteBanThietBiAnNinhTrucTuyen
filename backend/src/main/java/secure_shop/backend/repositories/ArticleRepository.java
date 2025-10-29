package secure_shop.backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import secure_shop.backend.entities.Article;

import java.util.UUID;

public interface ArticleRepository extends JpaRepository<Article, UUID> {
}
