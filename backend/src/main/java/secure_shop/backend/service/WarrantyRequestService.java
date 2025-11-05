package secure_shop.backend.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import secure_shop.backend.dto.ticket.WarrantyRequestDTO;

import java.util.List;
import java.util.UUID;

public interface WarrantyRequestService {
    WarrantyRequestDTO createWarrantyRequest(WarrantyRequestDTO warrantyRequestDTO);

    WarrantyRequestDTO updateWarrantyRequest(Long id, WarrantyRequestDTO warrantyRequestDTO);

    void deleteWarrantyRequest(Long id);

    WarrantyRequestDTO getWarrantyRequestById(Long id);

    List<WarrantyRequestDTO> getAllWarrantyRequests();

    Page<WarrantyRequestDTO> getWarrantyRequestsPage(Pageable pageable);

    List<WarrantyRequestDTO> getWarrantyRequestsByOrderItemId(Long orderItemId);

    List<WarrantyRequestDTO> getWarrantyRequestsByUserId(UUID userId);

    WarrantyRequestDTO approveWarrantyRequest(Long id);

    WarrantyRequestDTO rejectWarrantyRequest(Long id);

    WarrantyRequestDTO resolveWarrantyRequest(Long id);
}

