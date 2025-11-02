package secure_shop.backend.mapper;

import org.springframework.stereotype.Component;
import secure_shop.backend.dto.InventoryDTO;
import secure_shop.backend.entities.Inventory;
import secure_shop.backend.entities.Product;

@Component
public class InventoryMapper {

    public InventoryDTO toDTO(Inventory entity) {
        if (entity == null) return null;

        InventoryDTO dto = new InventoryDTO();
        dto.setId(entity.getId());
        dto.setOnHand(entity.getOnHand());
        dto.setReserved(entity.getReserved());

        if (entity.getProduct() != null) {
            dto.setProductId(entity.getProduct().getId());
            dto.setProductName(entity.getProduct().getName());
        }

        return dto;
    }

    public Inventory toEntity(InventoryDTO dto) {
        if (dto == null) return null;

        Inventory entity = new Inventory();
        entity.setId(dto.getId());
        entity.setOnHand(dto.getOnHand());
        entity.setReserved(dto.getReserved());

        if (dto.getProductId() != null) {
            Product product = new Product();
            product.setId(dto.getProductId());
            entity.setProduct(product);
        }

        return entity;
    }
}