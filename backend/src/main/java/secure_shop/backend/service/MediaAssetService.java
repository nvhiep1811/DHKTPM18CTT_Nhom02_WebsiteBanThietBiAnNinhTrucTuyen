package secure_shop.backend.service;

import secure_shop.backend.dto.MediaAssetDTO;
import java.util.List;
import java.util.UUID;

public interface MediaAssetService {

    List<MediaAssetDTO> getMediaByProductId(UUID productId);

    MediaAssetDTO addMediaToProduct(UUID productId, String url, String altText);

    void deleteMedia(Long mediaId);
}