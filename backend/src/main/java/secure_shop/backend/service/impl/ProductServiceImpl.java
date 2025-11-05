package secure_shop.backend.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import secure_shop.backend.dto.product.ProductDTO;
import secure_shop.backend.dto.product.ProductDetailsDTO;
import secure_shop.backend.dto.product.ProductSummaryDTO;
import secure_shop.backend.entities.Brand;
import secure_shop.backend.entities.Category;
import secure_shop.backend.entities.Product;
import secure_shop.backend.exception.ResourceNotFoundException;
import secure_shop.backend.mapper.ProductMapper;
import secure_shop.backend.repositories.BrandRepository;
import secure_shop.backend.repositories.CategoryRepository;
import secure_shop.backend.repositories.ProductRepository;
import secure_shop.backend.service.ProductService;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductServiceImpl implements ProductService {
    private final ProductRepository productRepository;
    private final BrandRepository brandRepository;
    private final CategoryRepository categoryRepository;
    private final ProductMapper productMapper;

    public Page<ProductSummaryDTO> filterProducts(Boolean active, Long categoryId, Long brandId, Pageable pageable) {
        return productRepository
                .filterProducts(active, categoryId, brandId, pageable)
                .map(productMapper::toProductSummaryDTO);
    }


    public ProductDTO getProductById(UUID id) {
        Product product = productRepository.findProductById(id);
        if (product == null) {
            throw new ResourceNotFoundException("Product", id);
        }
        return productMapper.toProductDTO(product);
    }

    public ProductDetailsDTO getProductDetailsById(UUID id) {
        Product product = productRepository.findProductById(id);
        if (product == null) {
            throw new ResourceNotFoundException("Product", id);
        }
        return productMapper.toProductDetailsDTO(product);
    }

    @Transactional
    public ProductDTO createProduct(ProductDetailsDTO dto) {
        Product p = productMapper.toEntity(dto);
        var savedProduct = productRepository.save(p);
        return productMapper.toProductDTO(savedProduct);
    }

    @Transactional
    public ProductDTO updateProduct(UUID id, ProductDetailsDTO dto) {
        Product existingProduct = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", id));

        // Update basic fields
        existingProduct.setSku(dto.getSku());
        existingProduct.setName(dto.getName());
        existingProduct.setListedPrice(dto.getListedPrice());
        existingProduct.setActive(dto.getActive());
        existingProduct.setShortDesc(dto.getShortDesc());
        existingProduct.setLongDesc(dto.getLongDesc());
        existingProduct.setThumbnailUrl(dto.getThumbnailUrl());

        // Update brand relationship (shallow update - only set if changed)
        if (dto.getBrand() != null && dto.getBrand().getId() != null) {
            Brand brand = brandRepository.findById(dto.getBrand().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Brand", dto.getBrand().getId()));
            existingProduct.setBrand(brand);
        } else {
            existingProduct.setBrand(null);
        }

        // Update category relationship (shallow update - only set if changed)
        if (dto.getCategory() != null && dto.getCategory().getId() != null) {
            Category category = categoryRepository.findById(dto.getCategory().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", dto.getCategory().getId()));
            existingProduct.setCategory(category);
        } else {
            existingProduct.setCategory(null);
        }

        // Note: mediaAssets and reviews should be managed via separate endpoints/services
        // Not updated here to avoid accidentally breaking relationships

        var updatedProduct = productRepository.save(existingProduct);
        return productMapper.toProductDTO(updatedProduct);
    }

    @Transactional
    public Boolean deleteProduct(UUID id) {
        if (!existsById(id)) {
            return false;
        }
        productRepository.deleteById(id);
        return true;
    }

    @Override
    public Boolean existsById(UUID id) {
        return productRepository.existsById(id);
    }

}
