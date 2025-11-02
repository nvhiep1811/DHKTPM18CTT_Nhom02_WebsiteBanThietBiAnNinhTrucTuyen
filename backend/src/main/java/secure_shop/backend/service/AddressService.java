package secure_shop.backend.service;

import secure_shop.backend.dto.AddressDTO;
import secure_shop.backend.dto.request.CreateAddressRequest;
import secure_shop.backend.dto.request.UpdateAddressRequest;
import secure_shop.backend.entities.Address;

import java.util.List;
import java.util.UUID;

public interface AddressService {
    List<AddressDTO> getAddressesByUser(UUID userId);
    AddressDTO createAddress(UUID userId, CreateAddressRequest req);
    AddressDTO updateAddress(UUID userId, Long addressId, UpdateAddressRequest req);
    void deleteAddress(UUID userId, Long addressId);
    AddressDTO setDefaultAddress(UUID userId, Long addressId);
}
