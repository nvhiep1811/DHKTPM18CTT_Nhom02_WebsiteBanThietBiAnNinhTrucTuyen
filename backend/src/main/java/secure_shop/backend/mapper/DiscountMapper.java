package secure_shop.backend.mapper;

import org.springframework.stereotype.Component;
import secure_shop.backend.dto.discount.DiscountDTO;
import secure_shop.backend.dto.discount.DiscountDetailsDTO;
import secure_shop.backend.entities.Discount;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class DiscountMapper {

    public DiscountDTO toDTO(Discount discount) {
        if (discount == null) return null;

        return DiscountDTO.builder()
                .id(discount.getId())
                .code(discount.getCode())
                .discountType(discount.getDiscountType())
                .discountValue(discount.getDiscountValue())
                .minOrderValue(discount.getMinOrderValue())
                .active(discount.getActive())
                .startAt(discount.getStartAt())
                .endAt(discount.getEndAt())
                .build();
    }

    public DiscountDetailsDTO toDetailsDTO(Discount discount) {
        if (discount == null) return null;

        return DiscountDetailsDTO.builder()
                .id(discount.getId())
                .code(discount.getCode())
                .discountType(discount.getDiscountType())
                .discountValue(discount.getDiscountValue())
                .minOrderValue(discount.getMinOrderValue())
                .maxUsage(discount.getMaxUsage())
                .perUserLimit(discount.getPerUserLimit())
                .used(discount.getUsed())
                .active(discount.getActive())
                .startAt(discount.getStartAt())
                .endAt(discount.getEndAt())
                .createdAt(discount.getCreatedAt())
                .updatedAt(discount.getUpdatedAt())
                .build();
    }

    public Discount toEntity(DiscountDTO dto) {
        if (dto == null) return null;

        Discount discount = Discount.builder()
                .code(dto.getCode())
                .discountType(dto.getDiscountType())
                .discountValue(dto.getDiscountValue())
                .minOrderValue(dto.getMinOrderValue())
                .active(dto.getActive())
                .startAt(dto.getStartAt())
                .endAt(dto.getEndAt())
                .build();

        discount.setId(dto.getId());
        return discount;
    }

    public List<DiscountDTO> toDTOList(List<Discount> discounts) {
        if (discounts == null) return List.of();
        return discounts.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public void updateEntityFromDTO(DiscountDTO dto, Discount entity) {
        if (dto == null || entity == null) return;

        if (dto.getCode() != null) entity.setCode(dto.getCode());
        if (dto.getDiscountType() != null) entity.setDiscountType(dto.getDiscountType());
        if (dto.getDiscountValue() != null) entity.setDiscountValue(dto.getDiscountValue());
        if (dto.getMinOrderValue() != null) entity.setMinOrderValue(dto.getMinOrderValue());
        if (dto.getActive() != null) entity.setActive(dto.getActive());
        if (dto.getStartAt() != null) entity.setStartAt(dto.getStartAt());
        if (dto.getEndAt() != null) entity.setEndAt(dto.getEndAt());
    }
}

