package secure_shop.backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import secure_shop.backend.entities.Address;

public interface AddressRepository extends JpaRepository<Address, Integer> {
}
