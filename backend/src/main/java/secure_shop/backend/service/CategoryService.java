package secure_shop.backend.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import secure_shop.backend.dto.product.CategoryDTO;
import secure_shop.backend.dto.product.CategorySummaryDTO;

import java.util.List;

public interface CategoryService {
    Page<CategoryDTO> getAllCategories(Pageable pageable, Boolean active);
    List<CategorySummaryDTO> getAllActive();
    CategoryDTO getById(Long id);
    CategoryDTO create(CategoryDTO dto);
    CategoryDTO update(Long id, CategoryDTO dto);
    void delete(Long id);
}
