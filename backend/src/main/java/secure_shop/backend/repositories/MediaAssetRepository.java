package secure_shop.backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import secure_shop.backend.entities.MediaAsset;

import java.util.Set;
import java.util.UUID;

public interface MediaAssetRepository extends JpaRepository<MediaAsset, Integer> {
    Set<MediaAsset> findByProductId(UUID productId);
}
