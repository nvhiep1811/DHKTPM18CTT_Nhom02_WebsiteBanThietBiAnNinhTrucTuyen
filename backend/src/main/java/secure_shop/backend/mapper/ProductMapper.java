// java
package secure_shop.backend.mapper;

import org.springframework.stereotype.Component;
import secure_shop.backend.dto.product.ProductDTO;
import secure_shop.backend.dto.product.ProductDetailsDTO;
import secure_shop.backend.dto.product.ProductSummaryDTO;
import secure_shop.backend.entities.MediaAsset;
import secure_shop.backend.entities.Product;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class ProductMapper {

    private final BrandMapper brandMapper;
    private final CategoryMapper categoryMapper;
    private final MediaAssetMapper mediaAssetMapper;
    private final ReviewMapper reviewMapper;
    private final InventoryMapper inventoryMapper;

    public ProductMapper(BrandMapper brandMapper,
                         CategoryMapper categoryMapper,
                         MediaAssetMapper mediaAssetMapper,
                         ReviewMapper reviewMapper, InventoryMapper inventoryMapper) {
        this.brandMapper = brandMapper;
        this.categoryMapper = categoryMapper;
        this.mediaAssetMapper = mediaAssetMapper;
        this.reviewMapper = reviewMapper;
        this.inventoryMapper = inventoryMapper;
    }

    public ProductDTO toProductDTO(Product p) {
        if (p == null) return null;

        return ProductDTO.builder()
                .id(p.getId())
                .sku(p.getSku())
                .name(p.getName())
                .shortDesc(p.getShortDesc())
                .listedPrice(p.getListedPrice())
                .price(p.getPrice())
                .active(p.getActive())
                .createdAt(p.getCreatedAt())
                .updatedAt(p.getUpdatedAt())
                .deletedAt(p.getDeletedAt())
                .thumbnailUrl(p.getThumbnailUrl())
                .inventory(inventoryMapper.toDTO(p.getInventory()))
                .brand(brandMapper.toDTO(p.getBrand()))
                .category(categoryMapper.toSummaryDTO(p.getCategory()))
                .rating(p.getRating())
                .reviewCount(p.getReviewCount())
                .build();
    }

    public List<ProductDTO> toProductDTOList(List<Product> products) {
        if (products == null) return Collections.emptyList();

        return products.stream()
                .map(this::toProductDTO)
                .collect(Collectors.toList());
    }

    public ProductSummaryDTO toProductSummaryDTO(Product p) {
        if (p == null) return null;

        return ProductSummaryDTO.builder()
                .id(p.getId())
                .sku(p.getSku())
                .name(p.getName())
                .listedPrice(p.getListedPrice())
                .price(p.getPrice())
                .thumbnailUrl(p.getThumbnailUrl())
                .brand(p.getBrand() != null ? brandMapper.toDTO(p.getBrand()) : null)
                .category(p.getCategory() != null ? categoryMapper.toSummaryDTO(p.getCategory()) : null)
                .availableStock(p.getInventory().getOnHand() - p.getInventory().getReserved())
                .inStock(p.getInventory().getOnHand() > p.getInventory().getReserved())
                .rating(p.getRating())
                .reviewCount(p.getReviewCount())
                .build();
    }

    public List<ProductSummaryDTO> toProductSummaryDTOList(List<Product> products) {
        if (products == null) return Collections.emptyList();

        return products.stream()
                .map(this::toProductSummaryDTO)
                .collect(Collectors.toList());
    }

    public ProductDetailsDTO toProductDetailsDTO(Product p) {
        if (p == null) return null;

        return ProductDetailsDTO.builder()
                .id(p.getId())
                .sku(p.getSku())
                .name(p.getName())
                .listedPrice(p.getListedPrice())
                .price(p.getPrice())
                .active(p.getActive())
                .brand(p.getBrand() != null ? brandMapper.toDTO(p.getBrand()) : null)
                .category(p.getCategory() != null ? categoryMapper.toSummaryDTO(p.getCategory()) : null)
                .shortDesc(p.getShortDesc())
                .longDesc(p.getLongDesc())
                .mediaAssets(p.getMediaAssets() != null ?
                        p.getMediaAssets().stream()
                                .map(mediaAssetMapper::toDTO)
                                .collect(Collectors.toList())
                        : Collections.emptyList())
                .availableStock(p.getInventory().getOnHand() - p.getInventory().getReserved())
                .inStock(p.getInventory().getOnHand() > p.getInventory().getReserved())
                .reviews(p.getReviews() != null ?
                        p.getReviews().stream()
                                .map(reviewMapper::toDTO)
                                .collect(Collectors.toSet())
                        : Collections.emptySet())
                .createdAt(p.getCreatedAt())
                .updatedAt(p.getUpdatedAt())
                .deletedAt(p.getDeletedAt())
                .thumbnailUrl(p.getThumbnailUrl())
                .rating(p.getRating())
                .reviewCount(p.getReviewCount())
                .build();
    }

    public Product toEntity(ProductDetailsDTO dto) {
        if (dto == null) return null;

        Product product = new Product();

        // Only set id when updating an existing entity; otherwise let JPA generate it
        if (dto.getId() != null) {
            product.setId(dto.getId());
        }

        product.setSku(dto.getSku());
        product.setName(dto.getName());
        product.setListedPrice(dto.getListedPrice());
        product.setPrice(dto.getPrice());
        product.setActive(dto.getActive());
        product.setShortDesc(dto.getShortDesc());
        product.setLongDesc(dto.getLongDesc());
        product.setThumbnailUrl(dto.getThumbnailUrl());

        // NOTE: Do not copy audit timestamps from client. Let JPA manage createdAt/updatedAt.
        // product.setCreatedAt(dto.getCreatedAt());
        // product.setUpdatedAt(dto.getUpdatedAt());
        // product.setDeletedAt(dto.getDeletedAt());

        product.setBrand(dto.getBrand() != null ? brandMapper.toEntity(dto.getBrand()) : null);
        product.setCategory(dto.getCategory() != null ? categoryMapper.toEntity(dto.getCategory()) : null);

        // Map media assets and ensure bi-directional link to product
        // Product.mediaAssets is List<String>, not Set
        List<MediaAsset> mappedMedia = new ArrayList<>();
        if (dto.getMediaAssets() != null) {
            for (var mediaDto : dto.getMediaAssets()) {
                MediaAsset mediaAsset = mediaAssetMapper.toEntity(mediaDto);
                mediaAsset.setProduct(product); // Set back-reference
                mappedMedia.add(mediaAsset);
            }
        }

        product.setMediaAssets(mappedMedia);

        // Don't map reviews from client DTO - reviews should be managed via ReviewService
        // Client cannot directly set reviews on a product
        // Reviews are created separately and linked to products

        // inventory should be set by InventoryMapper/service if required (kept as null)
        return product;
    }

}
