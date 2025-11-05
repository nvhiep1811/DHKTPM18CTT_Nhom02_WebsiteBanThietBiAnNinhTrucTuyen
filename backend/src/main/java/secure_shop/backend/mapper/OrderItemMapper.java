package secure_shop.backend.mapper;

import org.springframework.stereotype.Component;
import secure_shop.backend.dto.order.OrderItemDTO;
import secure_shop.backend.dto.product.ProductSummaryDTO;
import secure_shop.backend.entities.OrderItem;
import secure_shop.backend.entities.Product;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class OrderItemMapper {

    private final ProductMapper productMapper;

    public OrderItemMapper(ProductMapper productMapper) {
        this.productMapper = productMapper;
    }

    public OrderItemDTO toDTO(OrderItem orderItem) {
        if (orderItem == null) return null;

        ProductSummaryDTO productDTO = null;
        if (orderItem.getProduct() != null) {
            productDTO = productMapper.toProductSummaryDTO(orderItem.getProduct());
        }

        return OrderItemDTO.builder()
                .id(orderItem.getId())
                .unitPrice(orderItem.getUnitPrice())
                .quantity(orderItem.getQuantity())
                .lineTotal(orderItem.getLineTotal())
                .product(productDTO)
                .orderId(orderItem.getOrder() != null ? orderItem.getOrder().getId() : null)
                .build();
    }

    public OrderItem toEntity(OrderItemDTO dto) {
        if (dto == null) return null;

        OrderItem orderItem = new OrderItem();
        orderItem.setId(dto.getId());
        orderItem.setUnitPrice(dto.getUnitPrice());
        orderItem.setQuantity(dto.getQuantity());
        orderItem.setLineTotal(dto.getLineTotal());

        if (dto.getProduct() != null && dto.getProduct().getId() != null) {
            Product product = new Product();
            product.setId(dto.getProduct().getId());
            orderItem.setProduct(product);
        }

        return orderItem;
    }

    public List<OrderItemDTO> toDTOList(List<OrderItem> orderItems) {
        if (orderItems == null) return List.of();
        return orderItems.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public void updateEntityFromDTO(OrderItemDTO dto, OrderItem entity) {
        if (dto == null || entity == null) return;

        if (dto.getUnitPrice() != null) entity.setUnitPrice(dto.getUnitPrice());
        if (dto.getQuantity() != null) entity.setQuantity(dto.getQuantity());
        if (dto.getLineTotal() != null) entity.setLineTotal(dto.getLineTotal());
    }
}

