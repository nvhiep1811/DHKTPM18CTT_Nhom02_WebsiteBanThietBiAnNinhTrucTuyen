package secure_shop.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import secure_shop.backend.dto.cart.MergeCartRequest;
import secure_shop.backend.entities.cart.CartItem;
import secure_shop.backend.service.CartService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping
    public ResponseEntity<List<CartItem>> getCart() {
        return ResponseEntity.ok(cartService.getCartItems());
    }

    @PostMapping("/add")
    public ResponseEntity<?> addToCart(@RequestBody CartItem item) {
        cartService.addItem(item);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/update")
    public ResponseEntity<?> updateQuantity(@RequestBody CartItem request) {
        cartService.updateQuantity(request.getProductId(), request.getQuantity());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/remove/{id}")
    public ResponseEntity<?> removeItem(@PathVariable UUID id) {
        cartService.removeItem(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/clear")
    public ResponseEntity<?> clearCart() {
        cartService.clearCart();
        return ResponseEntity.ok().build();
    }

    @PostMapping("/merge")
    public ResponseEntity<?> mergeGuestCart(@RequestBody MergeCartRequest request) {
        cartService.mergeGuestCart(request.getItems());
        return ResponseEntity.ok("Cart merged successfully");
    }
}