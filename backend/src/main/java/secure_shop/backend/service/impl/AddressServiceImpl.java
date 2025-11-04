package secure_shop.backend.service.impl;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import secure_shop.backend.dto.address.AddressDTO;
import secure_shop.backend.dto.address.request.CreateAddressRequest;
import secure_shop.backend.dto.address.request.UpdateAddressRequest;
import secure_shop.backend.entities.Address;
import secure_shop.backend.entities.User;
import secure_shop.backend.mapper.AddressMapper;
import secure_shop.backend.repositories.AddressRepository;
import secure_shop.backend.repositories.UserRepository;
import secure_shop.backend.service.AddressService;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class AddressServiceImpl implements AddressService {

    private final AddressRepository addressRepository;
    private final UserRepository userRepository;
    private final AddressMapper addressMapper = new AddressMapper();

    @Override
    @Transactional(readOnly = true)
    public List<AddressDTO> getAddressesByUser(UUID userId) {
        List<Address> addresses = addressRepository.findByUserId(userId);
        return addresses.stream()
                .map(addressMapper::toDTO)
                .toList();
    }

    @Override
    public AddressDTO createAddress(UUID userId, CreateAddressRequest req) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        Address address = Address.builder()
                .name(req.getName())
                .phone(req.getPhone())
                .street(req.getStreet())
                .ward(req.getWard())
                .province(req.getProvince())
                .isDefault(Boolean.TRUE.equals(req.getIsDefault()))
                .user(user)
                .build();

        // Nếu isDefault = true, unset các address khác
        if (Boolean.TRUE.equals(req.getIsDefault())) {
            addressRepository.clearDefaultAddress(userId);
        }

        return addressMapper.toDTO(addressRepository.save(address));
    }

    @Override
    public AddressDTO updateAddress(UUID userId, Long addressId, UpdateAddressRequest req) {
        Address address = addressRepository.findByIdAndUserId(addressId, userId)
                .orElseThrow(() -> new EntityNotFoundException("Address not found"));

        address.setName(req.getName());
        address.setPhone(req.getPhone());
        address.setStreet(req.getStreet());
        address.setWard(req.getWard());
        address.setProvince(req.getProvince());

        if (req.getIsDefault() != null && req.getIsDefault()) {
            addressRepository.clearDefaultAddress(userId);
            address.setIsDefault(true);
        }

        return addressMapper.toDTO(addressRepository.save(address));
    }

    @Override
    public void deleteAddress(UUID userId, Long addressId) {
        Address address = addressRepository.findByIdAndUserId(addressId, userId)
                .orElseThrow(() -> new EntityNotFoundException("Address not found"));
        addressRepository.delete(address);
    }

    @Override
    public AddressDTO setDefaultAddress(UUID userId, Long addressId) {
        Address address = addressRepository.findByIdAndUserId(addressId, userId)
                .orElseThrow(() -> new EntityNotFoundException("Address not found"));

        addressRepository.clearDefaultAddress(userId);
        address.setIsDefault(true);

        return addressMapper.toDTO(addressRepository.save(address));
    }
}