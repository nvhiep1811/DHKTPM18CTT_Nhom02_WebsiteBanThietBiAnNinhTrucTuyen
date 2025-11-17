package secure_shop.backend.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import secure_shop.backend.dto.discount.DiscountDTO;
import secure_shop.backend.dto.discount.DiscountDetailsDTO;

import java.util.List;
import java.util.UUID;

public interface DiscountService {
    DiscountDTO createDiscount(DiscountDTO discountDTO);

    DiscountDTO updateDiscount(UUID id, DiscountDTO discountDTO);

    void deleteDiscount(UUID id);

    DiscountDTO getDiscountById(UUID id);

    DiscountDetailsDTO getDiscountDetailsById(UUID id);

    List<DiscountDTO> getAllDiscounts();

    Page<DiscountDTO> getDiscountsPage(Pageable pageable);

    List<DiscountDTO> getActiveDiscounts();

    DiscountDetailsDTO applyDiscountCode(String code);
}

