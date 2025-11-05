package secure_shop.backend.mapper;

import org.springframework.stereotype.Component;
import secure_shop.backend.dto.order.ShipmentDTO;
import secure_shop.backend.entities.Order;
import secure_shop.backend.entities.Shipment;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class ShipmentMapper {

    public ShipmentDTO toDTO(Shipment shipment) {
        if (shipment == null) return null;

        return ShipmentDTO.builder()
                .id(shipment.getId())
                .status(shipment.getStatus())
                .deliveredAt(shipment.getDeliveredAt())
                .shippedAt(shipment.getShippedAt())
                .orderId(shipment.getOrder() != null ? shipment.getOrder().getId() : null)
                .build();
    }

    public Shipment toEntity(ShipmentDTO dto) {
        if (dto == null) return null;

        Shipment shipment = Shipment.builder()
                .id(dto.getId())
                .status(dto.getStatus())
                .deliveredAt(dto.getDeliveredAt())
                .shippedAt(dto.getShippedAt())
                .build();

        if (dto.getOrderId() != null) {
            Order order = new Order();
            order.setId(dto.getOrderId());
            shipment.setOrder(order);
        }

        return shipment;
    }

    public List<ShipmentDTO> toDTOList(List<Shipment> shipments) {
        if (shipments == null) return List.of();
        return shipments.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public void updateEntityFromDTO(ShipmentDTO dto, Shipment entity) {
        if (dto == null || entity == null) return;

        if (dto.getStatus() != null) entity.setStatus(dto.getStatus());
        if (dto.getDeliveredAt() != null) entity.setDeliveredAt(dto.getDeliveredAt());
        if (dto.getShippedAt() != null) entity.setShippedAt(dto.getShippedAt());
    }
}

