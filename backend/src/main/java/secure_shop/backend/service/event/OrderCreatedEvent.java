package secure_shop.backend.service.event;

import java.util.UUID;

public record OrderCreatedEvent(UUID orderId) {}
