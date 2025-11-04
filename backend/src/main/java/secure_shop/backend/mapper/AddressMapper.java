package secure_shop.backend.mapper;

import secure_shop.backend.dto.address.AddressDTO;
import secure_shop.backend.entities.Address;

public class AddressMapper {
    public AddressDTO toDTO(Address address) {

        return AddressDTO.builder()
                .id(address.getId())
                .name(address.getName())
                .phone(address.getPhone())
                .street(address.getStreet())
                .ward(address.getWard())
                .province(address.getProvince())
                .isDefault(address.getIsDefault())
                .userId(address.getUser().getId())
                .build();
    }
}
