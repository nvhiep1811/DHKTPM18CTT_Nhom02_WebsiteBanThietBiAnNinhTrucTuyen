package secure_shop.backend.mapper;

import org.springframework.stereotype.Component;
import secure_shop.backend.dto.ticket.WarrantyRequestDTO;
import secure_shop.backend.entities.OrderItem;
import secure_shop.backend.entities.WarrantyRequest;
import secure_shop.backend.enums.WarrantyStatus;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class WarrantyRequestMapper {

    private final ProductMapper productMapper;

    public WarrantyRequestMapper(ProductMapper productMapper) {
        this.productMapper = productMapper;
    }

    public WarrantyRequestDTO toDTO(WarrantyRequest warrantyRequest) {
        if (warrantyRequest == null) return null;

        WarrantyRequestDTO.WarrantyRequestDTOBuilder builder = WarrantyRequestDTO.builder()
                .id(warrantyRequest.getId())
                .issueType(warrantyRequest.getIssueType())
                .description(warrantyRequest.getDescription())
                .status(warrantyRequest.getStatus() != null ? warrantyRequest.getStatus().name() : null)
                .requestedAt(warrantyRequest.getRequestedAt())
                .resolvedAt(warrantyRequest.getResolvedAt());

        if (warrantyRequest.getOrderItem() != null) {
            OrderItem orderItem = warrantyRequest.getOrderItem();
            builder.orderItemId(orderItem.getId())
                   .unitPrice(orderItem.getUnitPrice())
                   .quantity(orderItem.getQuantity());

            if (orderItem.getProduct() != null) {
                builder.product(productMapper.toProductSummaryDTO(orderItem.getProduct()));
            }
        }

        return builder.build();
    }

    public WarrantyRequest toEntity(WarrantyRequestDTO dto) {
        if (dto == null) return null;

        WarrantyRequest warrantyRequest = WarrantyRequest.builder()
                .id(dto.getId())
                .issueType(dto.getIssueType())
                .description(dto.getDescription())
                .requestedAt(dto.getRequestedAt())
                .resolvedAt(dto.getResolvedAt())
                .build();

        if (dto.getStatus() != null) {
            try {
                warrantyRequest.setStatus(WarrantyStatus.valueOf(dto.getStatus()));
            } catch (IllegalArgumentException e) {
                // Keep default status if invalid
            }
        }

        if (dto.getOrderItemId() != null) {
            OrderItem orderItem = new OrderItem();
            orderItem.setId(dto.getOrderItemId());
            warrantyRequest.setOrderItem(orderItem);
        }

        return warrantyRequest;
    }

    public List<WarrantyRequestDTO> toDTOList(List<WarrantyRequest> warrantyRequests) {
        if (warrantyRequests == null) return List.of();
        return warrantyRequests.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public void updateEntityFromDTO(WarrantyRequestDTO dto, WarrantyRequest entity) {
        if (dto == null || entity == null) return;

        if (dto.getIssueType() != null) entity.setIssueType(dto.getIssueType());
        if (dto.getDescription() != null) entity.setDescription(dto.getDescription());
        if (dto.getResolvedAt() != null) entity.setResolvedAt(dto.getResolvedAt());

        if (dto.getStatus() != null) {
            try {
                entity.setStatus(WarrantyStatus.valueOf(dto.getStatus()));
            } catch (IllegalArgumentException e) {
                // Ignore invalid status
            }
        }
    }
}

