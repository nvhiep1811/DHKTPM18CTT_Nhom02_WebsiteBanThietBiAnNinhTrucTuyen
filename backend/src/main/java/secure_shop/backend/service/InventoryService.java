package secure_shop.backend.service;

import secure_shop.backend.dto.product.InventoryDTO;

import java.util.List;
import java.util.UUID;

public interface InventoryService {

    List<InventoryDTO> getAllInventories();

    InventoryDTO getByProductId(UUID productId);

    InventoryDTO updateStock(UUID productId, int quantityChange);

    InventoryDTO createInventory(UUID productId, int onHand);

    void reserveStock(Long inventoryId, int quantity);

    void releaseStock(Long inventoryId, int quantity);

    void consumeReservedStock(Long inventoryId, int quantity);
}