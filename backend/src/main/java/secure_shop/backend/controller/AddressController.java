package secure_shop.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import secure_shop.backend.dto.address.AddressDTO;
import secure_shop.backend.config.security.CustomUserDetails;
import secure_shop.backend.dto.address.request.CreateAddressRequest;
import secure_shop.backend.dto.address.request.UpdateAddressRequest;
import secure_shop.backend.service.AddressService;

import java.util.List;

@RestController
@RequestMapping("/api/addresses")
@RequiredArgsConstructor
public class AddressController {

    private final AddressService addressService;

    @GetMapping
    public ResponseEntity<List<AddressDTO>> getMyAddresses(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        List<AddressDTO> addresses = addressService.getAddressesByUser(userDetails.getUser().getId());
        return ResponseEntity.ok(addresses);
    }

    @PostMapping
    public ResponseEntity<AddressDTO> createAddress(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody CreateAddressRequest req) {
        AddressDTO created = addressService.createAddress(userDetails.getUser().getId(), req);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<AddressDTO> updateAddress(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long id,
            @RequestBody UpdateAddressRequest req) {
        AddressDTO updated = addressService.updateAddress(userDetails.getUser().getId(), id, req);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAddress(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long id) {
        addressService.deleteAddress(userDetails.getUser().getId(), id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/default")
    public ResponseEntity<AddressDTO> setDefaultAddress(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long id) {
        AddressDTO updated = addressService.setDefaultAddress(userDetails.getUser().getId(), id);
        return ResponseEntity.ok(updated);
    }
}