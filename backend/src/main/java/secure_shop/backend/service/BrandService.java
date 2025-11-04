package secure_shop.backend.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import secure_shop.backend.dto.product.BrandDTO;

public interface BrandService {
    Page<BrandDTO> getAllBrands(Pageable pageable);
    BrandDTO getBrandById(Long id);
    BrandDTO createBrand(BrandDTO dto);
    BrandDTO updateBrand(Long id, BrandDTO dto);
    void deleteBrand(Long id);
}
