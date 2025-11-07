package secure_shop.backend.mapper;

import org.springframework.stereotype.Component;
import secure_shop.backend.dto.product.CategoryDTO;
import secure_shop.backend.dto.product.CategorySummaryDTO;
import secure_shop.backend.entities.Category;

@Component
public class CategoryMapper {
    public CategoryDTO toDTO(Category entity) {
        if (entity == null) return null;
        return CategoryDTO.builder()
                .id(entity.getId())
                .name(entity.getName())
                .description(entity.getDescription())
                .imageUrl(entity.getImageUrl())
                .active(entity.getActive())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public CategorySummaryDTO toSummaryDTO(Category entity) {
        if (entity == null) return null;
        return CategorySummaryDTO.builder()
                .id(entity.getId())
                .name(entity.getName())
                .imageUrl(entity.getImageUrl())
                .build();
    }

    public Category toEntity(CategoryDTO dto) {
        if (dto == null) return null;
        return Category.builder()
                .id(dto.getId())
                .name(dto.getName())
                .description(dto.getDescription())
                .imageUrl(dto.getImageUrl())
                .active(dto.getActive() != null ? dto.getActive() : true)
                .build();
    }

    public Category toEntity(CategorySummaryDTO dto) {
        if (dto == null) return null;
        return Category.builder()
                .id(dto.getId())
                .name(dto.getName())
                .imageUrl(dto.getImageUrl())
                .build();
    }
}
