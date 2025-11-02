package secure_shop.backend.mapper;

import org.springframework.stereotype.Component;
import secure_shop.backend.dto.BrandDTO;
import secure_shop.backend.entities.Brand;

@Component
public class BrandMapper {

    public BrandDTO toDTO(Brand brand) {
        if (brand == null) return null;
        return BrandDTO.builder()
                .id(brand.getId())
                .name(brand.getName())
                .build();
    }

    public Brand toEntity(BrandDTO dto) {
        if (dto == null) return null;
        return Brand.builder()
                .id(dto.getId())
                .name(dto.getName())
                .build();
    }
}