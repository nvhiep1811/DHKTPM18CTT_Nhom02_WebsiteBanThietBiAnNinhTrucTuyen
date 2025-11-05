package secure_shop.backend.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import secure_shop.backend.dto.ticket.WarrantyRequestDTO;
import secure_shop.backend.entities.WarrantyRequest;
import secure_shop.backend.enums.WarrantyStatus;
import secure_shop.backend.exception.ResourceNotFoundException;
import secure_shop.backend.mapper.WarrantyRequestMapper;
import secure_shop.backend.repositories.WarrantyRequestRepository;
import secure_shop.backend.service.WarrantyRequestService;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class WarrantyRequestServiceImpl implements WarrantyRequestService {

    private final WarrantyRequestRepository warrantyRequestRepository;
    private final WarrantyRequestMapper warrantyRequestMapper;

    @Override
    public WarrantyRequestDTO createWarrantyRequest(WarrantyRequestDTO warrantyRequestDTO) {
        WarrantyRequest warrantyRequest = warrantyRequestMapper.toEntity(warrantyRequestDTO);
        WarrantyRequest savedWarrantyRequest = warrantyRequestRepository.save(warrantyRequest);
        return warrantyRequestMapper.toDTO(savedWarrantyRequest);
    }

    @Override
    public WarrantyRequestDTO updateWarrantyRequest(Long id, WarrantyRequestDTO warrantyRequestDTO) {
        WarrantyRequest warrantyRequest = warrantyRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("WarrantyRequest", id));

        warrantyRequestMapper.updateEntityFromDTO(warrantyRequestDTO, warrantyRequest);
        WarrantyRequest updatedWarrantyRequest = warrantyRequestRepository.save(warrantyRequest);
        return warrantyRequestMapper.toDTO(updatedWarrantyRequest);
    }

    @Override
    public void deleteWarrantyRequest(Long id) {
        if (!warrantyRequestRepository.existsById(id)) {
            throw new ResourceNotFoundException("WarrantyRequest", id);
        }
        warrantyRequestRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public WarrantyRequestDTO getWarrantyRequestById(Long id) {
        WarrantyRequest warrantyRequest = warrantyRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("WarrantyRequest", id));
        return warrantyRequestMapper.toDTO(warrantyRequest);
    }

    @Override
    @Transactional(readOnly = true)
    public List<WarrantyRequestDTO> getAllWarrantyRequests() {
        return warrantyRequestRepository.findAll().stream()
                .map(warrantyRequestMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<WarrantyRequestDTO> getWarrantyRequestsPage(Pageable pageable) {
        return warrantyRequestRepository.findAll(pageable)
                .map(warrantyRequestMapper::toDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public List<WarrantyRequestDTO> getWarrantyRequestsByOrderItemId(Long orderItemId) {
        return warrantyRequestRepository.findByOrderItemId(orderItemId).stream()
                .map(warrantyRequestMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<WarrantyRequestDTO> getWarrantyRequestsByUserId(java.util.UUID userId) {
        return warrantyRequestRepository.findByUserId(userId).stream()
                .map(warrantyRequestMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public WarrantyRequestDTO approveWarrantyRequest(Long id) {
        WarrantyRequest warrantyRequest = warrantyRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("WarrantyRequest not found with id: " + id));

        warrantyRequest.setStatus(WarrantyStatus.ACCEPTED);
        WarrantyRequest updatedWarrantyRequest = warrantyRequestRepository.save(warrantyRequest);
        return warrantyRequestMapper.toDTO(updatedWarrantyRequest);
    }

    @Override
    public WarrantyRequestDTO rejectWarrantyRequest(Long id) {
        WarrantyRequest warrantyRequest = warrantyRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("WarrantyRequest not found with id: " + id));

        warrantyRequest.setStatus(WarrantyStatus.REJECTED);
        warrantyRequest.setResolvedAt(Instant.now());
        WarrantyRequest updatedWarrantyRequest = warrantyRequestRepository.save(warrantyRequest);
        return warrantyRequestMapper.toDTO(updatedWarrantyRequest);
    }

    @Override
    public WarrantyRequestDTO resolveWarrantyRequest(Long id) {
        WarrantyRequest warrantyRequest = warrantyRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("WarrantyRequest not found with id: " + id));

        warrantyRequest.setStatus(WarrantyStatus.REPAIRED);
        warrantyRequest.setResolvedAt(Instant.now());
        WarrantyRequest updatedWarrantyRequest = warrantyRequestRepository.save(warrantyRequest);
        return warrantyRequestMapper.toDTO(updatedWarrantyRequest);
    }
}

