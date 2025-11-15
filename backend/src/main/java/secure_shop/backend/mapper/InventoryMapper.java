package secure_shop.backend.mapper;

import org.springframework.stereotype.Component;
import secure_shop.backend.dto.product.InventoryDTO;
import secure_shop.backend.entities.Inventory;

@Component
public class InventoryMapper {

    public InventoryDTO toDTO(Inventory entity) {
        if (entity == null) return null;

        InventoryDTO dto = new InventoryDTO();
        dto.setOnHand(entity.getOnHand());
        dto.setReserved(entity.getReserved());
        dto.setInStock(entity.getOnHand() - entity.getReserved() > 0);
        dto.setProductId(entity.getProduct().getId());
        return dto;
    }

    public Inventory toEntity(InventoryDTO dto) {
        if (dto == null) return null;

        Inventory entity = new Inventory();
        entity.setOnHand(dto.getOnHand());
        entity.setReserved(dto.getReserved());

        return entity;
    }
}