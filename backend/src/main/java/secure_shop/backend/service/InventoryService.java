package secure_shop.backend.service;

import secure_shop.backend.dto.product.InventoryDTO;

import java.util.List;
import java.util.UUID;

public interface InventoryService {

    List<InventoryDTO> getAllInventories();

    InventoryDTO getByProductId(UUID productId);

    InventoryDTO updateStock(UUID productId, int quantityChange);

    InventoryDTO createInventory(UUID productId, int onHand);
}