package secure_shop.backend.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import secure_shop.backend.dto.order.ShipmentDTO;
import secure_shop.backend.entities.Shipment;
import secure_shop.backend.enums.ShipmentStatus;
import secure_shop.backend.mapper.ShipmentMapper;
import secure_shop.backend.repositories.ShipmentRepository;
import secure_shop.backend.service.ShipmentService;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ShipmentServiceImpl implements ShipmentService {

    private final ShipmentRepository shipmentRepository;
    private final ShipmentMapper shipmentMapper;

    @Override
    public ShipmentDTO createShipment(ShipmentDTO shipmentDTO) {
        Shipment shipment = shipmentMapper.toEntity(shipmentDTO);
        Shipment savedShipment = shipmentRepository.save(shipment);
        return shipmentMapper.toDTO(savedShipment);
    }

    @Override
    public ShipmentDTO updateShipment(Long id, ShipmentDTO shipmentDTO) {
        Shipment shipment = shipmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Shipment not found with id: " + id));

        shipmentMapper.updateEntityFromDTO(shipmentDTO, shipment);
        Shipment updatedShipment = shipmentRepository.save(shipment);
        return shipmentMapper.toDTO(updatedShipment);
    }

    @Override
    public void deleteShipment(Long id) {
        if (!shipmentRepository.existsById(id)) {
            throw new RuntimeException("Shipment not found with id: " + id);
        }
        shipmentRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public ShipmentDTO getShipmentById(Long id) {
        Shipment shipment = shipmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Shipment not found with id: " + id));
        return shipmentMapper.toDTO(shipment);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ShipmentDTO> getAllShipments() {
        return shipmentRepository.findAll().stream()
                .map(shipmentMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ShipmentDTO> getShipmentsPage(Pageable pageable) {
        return shipmentRepository.findAll(pageable)
                .map(shipmentMapper::toDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public ShipmentDTO getShipmentByOrderId(UUID orderId) {
        Shipment shipment = shipmentRepository.findAll().stream()
                .filter(s -> s.getOrder() != null && s.getOrder().getId().equals(orderId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Shipment not found for order id: " + orderId));
        return shipmentMapper.toDTO(shipment);
    }

    @Override
    public ShipmentDTO markAsShipped(Long id) {
        Shipment shipment = shipmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Shipment not found with id: " + id));

        shipment.setStatus(ShipmentStatus.IN_TRANSIT);
        shipment.setShippedAt(Instant.now());

        Shipment updatedShipment = shipmentRepository.save(shipment);
        return shipmentMapper.toDTO(updatedShipment);
    }

    @Override
    public ShipmentDTO markAsDelivered(Long id) {
        Shipment shipment = shipmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Shipment not found with id: " + id));

        shipment.setStatus(ShipmentStatus.DELIVERED);
        shipment.setDeliveredAt(Instant.now());

        Shipment updatedShipment = shipmentRepository.save(shipment);
        return shipmentMapper.toDTO(updatedShipment);
    }

    @Override
    public List<ShipmentDTO> getShipmentsByUserId(UUID userId) {
        return shipmentRepository.findByOrder_User_Id(userId)
                .stream()
                .map(shipmentMapper::toDTO)
                .collect(Collectors.toList());
    }
}

