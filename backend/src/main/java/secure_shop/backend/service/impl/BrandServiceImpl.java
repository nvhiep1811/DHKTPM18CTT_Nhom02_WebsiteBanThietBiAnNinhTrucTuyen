package secure_shop.backend.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import secure_shop.backend.dto.BrandDTO;
import secure_shop.backend.entities.Brand;
import secure_shop.backend.mapper.BrandMapper;
import secure_shop.backend.repositories.BrandRepository;
import secure_shop.backend.service.BrandService;

@Service
@RequiredArgsConstructor
public class BrandServiceImpl implements BrandService {

    private final BrandRepository brandRepository;
    private final BrandMapper brandMapper;

    @Override
    @Transactional(readOnly = true)
    public Page<BrandDTO> getAllBrands(Pageable pageable) {
        return brandRepository.findAll(pageable)
                .map(brandMapper::toDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public BrandDTO getBrandById(Long id) {
        Brand brand = brandRepository.findById(id);

        if (brand == null) {
            throw new RuntimeException("Brand not found");
        }

        return brandMapper.toDTO(brand);
    }

    @Override
    public BrandDTO createBrand(BrandDTO dto) {
        if (brandRepository.existsByName(dto.getName())) {
            throw new RuntimeException("Brand name already exists");
        }
        Brand brand = brandMapper.toEntity(dto);
        return brandMapper.toDTO(brandRepository.save(brand));
    }

    @Override
    public BrandDTO updateBrand(Long id, BrandDTO dto) {
        Brand brand = brandRepository.findById(id);
        if (brand == null) {
            throw new RuntimeException("Brand not found");
        }
        if (!brand.getName().equals(dto.getName()) && brandRepository.existsByName(dto.getName())) {
            throw new RuntimeException("Brand name already exists");
        }
        brand.setName(dto.getName());
        return brandMapper.toDTO(brandRepository.save(brand));
    }

    @Override
    public void deleteBrand(Long id) {
        brandRepository.deleteById(id);
    }
}