package secure_shop.backend.service.impl;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import secure_shop.backend.dto.product.InventoryDTO;
import secure_shop.backend.entities.Inventory;
import secure_shop.backend.entities.Product;
import secure_shop.backend.mapper.InventoryMapper;
import secure_shop.backend.repositories.InventoryRepository;
import secure_shop.backend.repositories.ProductRepository;
import secure_shop.backend.service.InventoryService;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class InventoryServiceImpl implements InventoryService {

    private final InventoryRepository inventoryRepository;
    private final ProductRepository productRepository;
    private final InventoryMapper inventoryMapper;

    @Override
    public List<InventoryDTO> getAllInventories() {
        return inventoryRepository.findAll()
                .stream()
                .map(inventoryMapper::toDTO)
                .toList();
    }

    @Override
    public InventoryDTO getByProductId(UUID productId) {
        Inventory inventory = inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Không tìm thấy tồn kho cho sản phẩm ID: " + productId));
        return inventoryMapper.toDTO(inventory);
    }

    @Override
    public InventoryDTO updateStock(UUID productId, int quantityChange) {
        Inventory inventory = inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Không tìm thấy tồn kho cho sản phẩm ID: " + productId));

        if (quantityChange > 0) {
            inventory.increaseStock(quantityChange);
        } else {
            inventory.decreaseStock(Math.abs(quantityChange));
        }

        return inventoryMapper.toDTO(inventoryRepository.save(inventory));
    }

    @Override
    public InventoryDTO createInventory(UUID productId, int onHand) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Không tìm thấy sản phẩm ID: " + productId));

        Inventory inventory = Inventory.builder()
                .product(product)
                .onHand(onHand)
                .reserved(0)
                .build();

        return inventoryMapper.toDTO(inventoryRepository.save(inventory));
    }
}