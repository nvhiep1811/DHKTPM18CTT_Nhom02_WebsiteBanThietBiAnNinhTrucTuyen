package secure_shop.backend.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import secure_shop.backend.dto.product.*;
import secure_shop.backend.entities.*;
import secure_shop.backend.exception.ResourceNotFoundException;
import secure_shop.backend.mapper.ProductMapper;
import secure_shop.backend.repositories.*;
import secure_shop.backend.service.ProductService;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final BrandRepository brandRepository;
    private final CategoryRepository categoryRepository;
    private final ProductMapper productMapper;
    private final InventoryRepository inventoryRepository;
    @Override
    public Page<ProductSummaryDTO> filterProducts(Boolean active,
                                                  Long categoryId,
                                                  Long brandId,
                                                  BigDecimal minPrice,
                                                  BigDecimal maxPrice,
                                                  Boolean inStock,
                                                  String keyword,
                                                  Pageable pageable) {
        return productRepository
                .filterProducts(active, categoryId, brandId, minPrice, maxPrice, inStock, keyword, pageable);
    }

    @Override
    public ProductDTO getProductById(UUID id) {
        Product product = productRepository.findProductById(id);
        if (product == null) {
            throw new ResourceNotFoundException("Product", id);
        }
        return productMapper.toProductDTO(product);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductDetailsDTO getProductDetailsById(UUID id) {
        return productRepository.findByIdWithRelations(id)
                .map(productMapper::toProductDetailsDTO)
                .orElseThrow(() -> new ResourceNotFoundException("Product", id));
    }

    @Override
    @Transactional
    public ProductDTO createProduct(ProductDetailsDTO dto) {
        Product product = productMapper.toEntity(dto);
        product.setDeletedAt(null); // đảm bảo không gán nhầm
        product.setActive(true);

        var saved = productRepository.save(product);

        Inventory inventory = new Inventory();
        inventory.setProduct(saved);
        inventory.setOnHand(dto.getAvailableStock() != null ? dto.getAvailableStock() : 0);
        inventory.setReserved(0);
        inventoryRepository.save(inventory);

        if (dto.getMediaAssets() != null && !dto.getMediaAssets().isEmpty()) {
            List<MediaAsset> mediaAssets = dto.getMediaAssets().stream()
                    .map(mediaDTO -> {
                        MediaAsset media = new MediaAsset();
                        media.setUrl(mediaDTO.getUrl());
                        media.setAltText(mediaDTO.getAltText());
                        media.setProduct(product);
                        return media;
                    })
                    .collect(Collectors.toList());
            product.setMediaAssets(mediaAssets);
        }
        return productMapper.toProductDTO(saved);
    }

    @Override
    @Transactional
    public ProductDTO updateProduct(UUID id, ProductDetailsDTO dto) {
        Product existing = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", id));

        // Nếu sản phẩm đã bị xóa mềm → không cho cập nhật
        if (existing.getDeletedAt() != null) {
            throw new IllegalStateException("Cannot update a deleted product");
        }

        existing.setSku(dto.getSku());
        existing.setName(dto.getName());
        existing.setListedPrice(dto.getListedPrice());
        existing.setActive(dto.getActive());
        existing.setShortDesc(dto.getShortDesc());
        existing.setLongDesc(dto.getLongDesc());
        existing.setThumbnailUrl(dto.getThumbnailUrl());

        // Update brand
        if (dto.getBrand() != null && dto.getBrand().getId() != null) {
            Brand brand = brandRepository.findById(dto.getBrand().getId());
            if (brand == null) {
                throw new ResourceNotFoundException("Brand", dto.getBrand().getId());
            }
            existing.setBrand(brand);
        } else {
            existing.setBrand(null);
        }

        // Update category
        if (dto.getCategory() != null && dto.getCategory().getId() != null) {
            Category category = categoryRepository.findById(dto.getCategory().getId());
            if (category == null) {
                throw new ResourceNotFoundException("Category", dto.getCategory().getId());
            }
            existing.setCategory(category);
        } else {
            existing.setCategory(null);
        }

        if (existing.getMediaAssets() != null) {
            existing.getMediaAssets().clear();
        }

        if (dto.getMediaAssets() != null && !dto.getMediaAssets().isEmpty()) {
            List<MediaAsset> newMediaAssets = dto.getMediaAssets().stream()
                    .map(mediaDTO -> {
                        MediaAsset media = new MediaAsset();
                        media.setUrl(mediaDTO.getUrl());
                        media.setAltText(mediaDTO.getAltText());
                        media.setProduct(existing);
                        return media;
                    })
                    .collect(Collectors.toList());

            if (existing.getMediaAssets() == null) {
                existing.setMediaAssets(new ArrayList<>());
            }
            existing.getMediaAssets().addAll(newMediaAssets);
        }


        var updated = productRepository.save(existing);
        return productMapper.toProductDTO(updated);
    }

    // Soft delete
    @Override
    @Transactional
    public Boolean deleteProduct(UUID id) {
        Optional<Product> productOpt = productRepository.findById(id);
        if (productOpt.isEmpty()) {
            return false;
        }

        Product product = productOpt.get();

        if (product.getDeletedAt() != null) {
            return false;
        }

        productRepository.delete(product);
        return true;
    }

    @Transactional
    public ProductDTO restoreProduct(UUID id) {
        Product product = productRepository.findDeletedById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Deleted Product", id));

        product.setDeletedAt(null);
        product.setActive(true);
        productRepository.save(product);

        return productMapper.toProductDTO(product);
    }

    @Override
    public Boolean existsById(UUID id) {
        return productRepository.existsById(id);
    }

    @Override
    public Integer getTotalProductsCount() {
        return productRepository.countProductsNotDeleted();
    }
}
