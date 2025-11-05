package secure_shop.backend.mapper;

import org.springframework.stereotype.Component;
import secure_shop.backend.dto.product.MediaAssetDTO;
import secure_shop.backend.entities.MediaAsset;
import secure_shop.backend.entities.Product;

import java.util.List;

@Component
public class MediaAssetMapper {

    public MediaAssetMapper() {
    }

    public MediaAssetDTO toDTO(MediaAsset asset) {
        if (asset == null) return null;

        MediaAssetDTO dto = MediaAssetDTO.builder()
                .id(asset.getId())
                .url(asset.getUrl())
                .altText(asset.getAltText())
                .build();

        if (asset.getProduct() != null) {
            Product p = asset.getProduct();
            dto.setProductName(p.getName());
            dto.setProductId(p.getId().toString());
        }
        return dto;
    }

    public MediaAsset toEntity(MediaAssetDTO dto) {
        if (dto == null) return null;

        MediaAsset asset = new MediaAsset();
        asset.setId(dto.getId());
        asset.setUrl(dto.getUrl());
        asset.setAltText(dto.getAltText());

        // Don't fetch product in mapper - let service layer or parent mapper handle the relationship
        // The product relationship will be set by ProductMapper when mapping the parent Product entity

        return asset;
    }

    public List<MediaAsset> toEntityList(List<MediaAssetDTO> dtoList) {
        return dtoList.stream().map(this::toEntity).toList();
    }

    public List<MediaAssetDTO> toDTOList(List<MediaAsset> entityList) {
        return entityList.stream().map(this::toDTO).toList();
    }
}
