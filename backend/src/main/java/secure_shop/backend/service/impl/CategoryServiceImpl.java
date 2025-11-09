package secure_shop.backend.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import secure_shop.backend.dto.product.CategoryDTO;
import secure_shop.backend.dto.product.CategorySummaryDTO;
import secure_shop.backend.entities.Category;
import secure_shop.backend.mapper.CategoryMapper;
import secure_shop.backend.repositories.CategoryRepository;
import secure_shop.backend.service.CategoryService;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;

    @Override
    public Page<CategoryDTO> getAllCategories(Pageable pageable, Boolean active) {
        Specification<Category> spec = (root, query, cb) -> {
            if (active != null) {
                return cb.equal(root.get("active"), active);
            }
            return cb.conjunction();
        };

        Page<Category> page = categoryRepository.findAll(spec, pageable);
        return page.map(categoryMapper::toDTO);
    }

    @Override
    @Cacheable(value = "categories:active")
    public List<CategorySummaryDTO> getAllActive() {
        log.info("Fetching active categories from DB (not cache)");
        return categoryRepository.findAll()
                .stream()
                .filter(Category::getActive)
                .map(categoryMapper::toSummaryDTO)
                .collect(Collectors.toList());
    }

    @Override
    public CategoryDTO getById(Long id) {
        Category category = categoryRepository.findById(id);
        if (category == null) {
            throw new RuntimeException("Category not found");
        }
        return categoryMapper.toDTO(category);
    }

    @Override
    @CacheEvict(value = "categories:active", allEntries = true)
    @Transactional
    public CategoryDTO create(CategoryDTO dto) {
        Category category = categoryMapper.toEntity(dto);
        return categoryMapper.toDTO(categoryRepository.save(category));
    }

    @Override
    @CacheEvict(value = "categories:active", allEntries = true)
    @Transactional
    public CategoryDTO update(Long id, CategoryDTO dto) {
        Category category = categoryRepository.findById(id);

        if (category == null) {
            throw new RuntimeException("Category not found");
        }

        category.setName(dto.getName());
        category.setDescription(dto.getDescription());
        category.setImageUrl(dto.getImageUrl());
        return categoryMapper.toDTO(categoryRepository.save(category));
    }

    @Override
    @CacheEvict(value = "categories:active", allEntries = true)
    @Transactional
    public void delete(Long id) {
        categoryRepository.deleteById(id);
    }
}