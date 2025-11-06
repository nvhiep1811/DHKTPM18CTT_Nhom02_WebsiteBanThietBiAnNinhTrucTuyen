package secure_shop.backend.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import secure_shop.backend.dto.order.ShipmentDTO;

import java.util.List;
import java.util.UUID;

public interface ShipmentService {
    ShipmentDTO createShipment(ShipmentDTO shipmentDTO);

    ShipmentDTO updateShipment(Long id, ShipmentDTO shipmentDTO);

    void deleteShipment(Long id);

    ShipmentDTO getShipmentById(Long id);

    List<ShipmentDTO> getAllShipments();

    Page<ShipmentDTO> getShipmentsPage(Pageable pageable);

    ShipmentDTO getShipmentByOrderId(UUID orderId);

    ShipmentDTO markAsShipped(Long id);

    ShipmentDTO markAsDelivered(Long id);

    List<ShipmentDTO> getShipmentsByUserId(UUID userId);
}

