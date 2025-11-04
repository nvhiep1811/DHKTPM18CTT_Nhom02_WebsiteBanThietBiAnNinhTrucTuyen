package secure_shop.backend.service.impl;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import secure_shop.backend.dto.product.MediaAssetDTO;
import secure_shop.backend.entities.MediaAsset;
import secure_shop.backend.entities.Product;
import secure_shop.backend.repositories.MediaAssetRepository;
import secure_shop.backend.repositories.ProductRepository;
import secure_shop.backend.service.MediaAssetService;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class MediaAssetServiceImpl implements MediaAssetService {

    private final MediaAssetRepository mediaAssetRepository;
    private final ProductRepository productRepository;

    @Override
    public List<MediaAssetDTO> getMediaByProductId(UUID productId) {
        List<MediaAsset> assets = mediaAssetRepository.findByProductId(productId);
        return assets.stream()
                .map(this::toDTO)
                .toList();
    }

    @Override
    public MediaAssetDTO addMediaToProduct(UUID productId, String url, String altText) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy sản phẩm ID: " + productId));

        MediaAsset asset = MediaAsset.builder()
                .url(url)
                .altText(altText)
                .product(product)
                .build();

        return toDTO(mediaAssetRepository.save(asset));
    }

    @Override
    public void deleteMedia(Long mediaId) {
        if (!mediaAssetRepository.existsById(mediaId)) {
            throw new EntityNotFoundException("Không tìm thấy media ID: " + mediaId);
        }
        mediaAssetRepository.deleteById(mediaId);
    }

    private MediaAssetDTO toDTO(MediaAsset entity) {
        return MediaAssetDTO.builder()
                .id(entity.getId())
                .url(entity.getUrl())
                .altText(entity.getAltText())
                .productName(entity.getProduct().getName())
                .productId(entity.getProduct().getId().toString())
                .build();
    }
}