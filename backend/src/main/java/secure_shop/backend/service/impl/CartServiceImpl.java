package secure_shop.backend.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import secure_shop.backend.entities.cart.CartItem;
import secure_shop.backend.entities.cart.CartSession;
import secure_shop.backend.exception.BadRequestException;
import secure_shop.backend.service.CartService;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {

    private static final String CART_KEY_PREFIX = "cart:user:";
    private static final long CART_EXPIRATION_DAYS = 7;

    private final RedisTemplate<String, Object> redisTemplate;

    /**
     * Lấy userId từ Security Context (user đã đăng nhập)
     */
    private String getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            throw new IllegalStateException("User chưa đăng nhập");
        }
        return auth.getName();
    }

    /**
     * Tạo Redis key cho cart của user
     */
    private String getCartKey(String userId) {
        return CART_KEY_PREFIX + userId;
    }

    /**
     * Lấy cart từ Redis, nếu không có thì tạo mới
     */
    @Override
    public CartSession getCart() {
        String userId = getCurrentUserId();
        String cartKey = getCartKey(userId);

        CartSession cart = (CartSession) redisTemplate.opsForValue().get(cartKey);
        if (cart == null) {
            cart = new CartSession();
            saveCart(cart);
        }
        return cart;
    }

    /**
     * Lưu cart vào Redis với expiration time
     */
    private void saveCart(CartSession cart) {
        String userId = getCurrentUserId();
        String cartKey = getCartKey(userId);
        redisTemplate.opsForValue().set(cartKey, cart, CART_EXPIRATION_DAYS, TimeUnit.DAYS);
    }

    @Override
    public List<CartItem> getCartItems() {
        return getCart().getItems();
    }

    @Override
    public void addItem(CartItem item) {
        // Validate input
        if (item == null || item.getProductId() == null) {
            throw new BadRequestException("Thông tin sản phẩm không hợp lệ");
        }

        if (item.getQuantity() <= 0) {
            throw new BadRequestException("Số lượng phải lớn hơn 0");
        }

        if (!item.isInStock()) {
            throw new BadRequestException("Sản phẩm hiện không có sẵn");
        }

        // Lấy cart hiện tại
        CartSession cart = getCart();

        // Kiểm tra xem sản phẩm đã có trong cart chưa
        Optional<CartItem> existing = cart.getItems().stream()
                .filter(i -> i.getProductId().equals(item.getProductId()))
                .findFirst();

        Integer maxQty = item.getAvailableStock() != null ? item.getAvailableStock() : 99;

        if (existing.isPresent()) {
            CartItem currentItem = existing.get();
            int newTotalQty = currentItem.getQuantity() + item.getQuantity();

            // Kiểm tra vượt quá tồn kho
            if (newTotalQty > maxQty) {
                int canAdd = maxQty - currentItem.getQuantity();
                if (canAdd <= 0) {
                    throw new BadRequestException(
                            String.format("Bạn đã có %d sản phẩm trong giỏ. Không thể thêm nữa!",
                                    currentItem.getQuantity())
                    );
                }
                throw new BadRequestException(
                        String.format("Chỉ có thể thêm tối đa %d sản phẩm nữa (tồn kho: %d)",
                                canAdd, maxQty)
                );
            }

            currentItem.setQuantity(newTotalQty);
            // Cập nhật thông tin mới nhất của sản phẩm
            currentItem.setName(item.getName());
            currentItem.setPrice(item.getPrice());
            currentItem.setThumbnailUrl(item.getThumbnailUrl());
            currentItem.setInStock(item.isInStock());
            currentItem.setAvailableStock(item.getAvailableStock());
        } else {
            // Kiểm tra số lượng thêm mới
            if (item.getQuantity() > maxQty) {
                throw new BadRequestException(
                        String.format("Số lượng yêu cầu vượt quá tồn kho (còn %d)", maxQty)
                );
            }
            cart.getItems().add(item);
        }

        saveCart(cart);
    }

    @Override
    public void updateQuantity(UUID productId, int quantity) {
        if (productId == null) {
            throw new BadRequestException("ID sản phẩm không hợp lệ");
        }

        if (quantity < 0) {
            throw new BadRequestException("Số lượng không hợp lệ");
        }

        CartSession cart = getCart();

        Optional<CartItem> itemOpt = cart.getItems().stream()
                .filter(i -> i.getProductId().equals(productId))
                .findFirst();

        if (itemOpt.isEmpty()) {
            throw new BadRequestException("Sản phẩm không tồn tại trong giỏ hàng");
        }

        CartItem item = itemOpt.get();

        // Nếu quantity = 0, xóa sản phẩm
        if (quantity == 0) {
            cart.getItems().remove(item);
            saveCart(cart);
            return;
        }

        // Kiểm tra tồn kho
        Integer maxQty = item.getAvailableStock() != null ? item.getAvailableStock() : 99;

        if (quantity > maxQty) {
            throw new BadRequestException(
                    String.format("Số lượng yêu cầu vượt quá tồn kho (còn %d)", maxQty)
            );
        }

        item.setQuantity(quantity);
        saveCart(cart);
    }

    @Override
    public void removeItem(UUID productId) {
        if (productId == null) {
            throw new BadRequestException("ID sản phẩm không hợp lệ");
        }

        CartSession cart = getCart();
        boolean removed = cart.getItems().removeIf(i -> i.getProductId().equals(productId));

        if (!removed) {
            throw new BadRequestException("Sản phẩm không tồn tại trong giỏ hàng");
        }

        saveCart(cart);
    }

    @Override
    public void clearCart() {
        String userId = getCurrentUserId();
        String cartKey = getCartKey(userId);
        redisTemplate.delete(cartKey);
    }

    @Override
    public void mergeGuestCart(List<CartItem> guestItems) {
        if (guestItems == null || guestItems.isEmpty()) {
            return;
        }

        CartSession cart = getCart();

        for (CartItem guestItem : guestItems) {
            if (guestItem == null || guestItem.getProductId() == null) {
                continue;
            }

            Optional<CartItem> existing = cart.getItems().stream()
                    .filter(i -> i.getProductId().equals(guestItem.getProductId()))
                    .findFirst();

            Integer maxQty = guestItem.getAvailableStock() != null ?
                    guestItem.getAvailableStock() : 99;

            if (existing.isPresent()) {
                CartItem current = existing.get();
                int mergedQty = current.getQuantity() + guestItem.getQuantity();

                // Giới hạn theo tồn kho
                if (mergedQty > maxQty) {
                    mergedQty = maxQty;
                }

                current.setQuantity(mergedQty);
                // Cập nhật thông tin mới nhất
                current.setName(guestItem.getName());
                current.setPrice(guestItem.getPrice());
                current.setThumbnailUrl(guestItem.getThumbnailUrl());
                current.setInStock(guestItem.isInStock());
                current.setAvailableStock(guestItem.getAvailableStock());
            } else {
                // Giới hạn số lượng khi thêm mới
                if (guestItem.getQuantity() > maxQty) {
                    guestItem.setQuantity(maxQty);
                }
                cart.getItems().add(guestItem);
            }
        }

        saveCart(cart);
    }

    /**
     * Xóa cart của một user cụ thể (dùng cho admin hoặc cleanup)
     */
    public void clearCartForUser(String userId) {
        String cartKey = getCartKey(userId);
        redisTemplate.delete(cartKey);
    }

    /**
     * Kiểm tra xem user có cart hay không
     */
    public boolean hasCart() {
        String userId = getCurrentUserId();
        String cartKey = getCartKey(userId);
        return Boolean.TRUE.equals(redisTemplate.hasKey(cartKey));
    }

    /**
     * Lấy số lượng items trong cart
     */
    public int getCartItemCount() {
        CartSession cart = getCart();
        return cart.getItems().stream()
                .mapToInt(CartItem::getQuantity)
                .sum();
    }

    /**
     * Validate và làm sạch cart (xóa sản phẩm hết hàng, điều chỉnh số lượng)
     * Gọi trước khi checkout
     */
    public void validateAndCleanCart() {
        CartSession cart = getCart();
        List<CartItem> items = cart.getItems();

        items.removeIf(item -> {
            // Xóa sản phẩm hết hàng
            if (!item.isInStock()) {
                return true;
            }

            // Điều chỉnh số lượng nếu vượt quá tồn kho
            Integer maxQty = item.getAvailableStock() != null ?
                    item.getAvailableStock() : 99;

            if (item.getQuantity() > maxQty) {
                if (maxQty <= 0) {
                    return true; // Xóa nếu hết hàng
                }
                item.setQuantity(maxQty);
            }

            return false;
        });

        saveCart(cart);
    }
}