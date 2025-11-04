package secure_shop.backend.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

@Entity
@Table(name = "addresses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Address {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Tên người nhận không được để trống")
    @Size(max = 100, message = "Tên người nhận tối đa 100 ký tự")
    @Column(nullable = false, length = 100)
    private String name;

    @NotBlank(message = "Số điện thoại không được để trống")
    @Pattern(
            regexp = "^(\\+\\d{1,3}[- ]?)?\\d{9,15}$",
            message = "Số điện thoại không hợp lệ"
    )
    @Column(nullable = false, length = 20)
    private String phone;

    @NotBlank(message = "Địa chỉ (đường, số nhà) không được để trống")
    @Size(max = 255, message = "Địa chỉ tối đa 255 ký tự")
    @Column(nullable = false)
    private String street;

    @NotBlank(message = "Phường / Xã không được để trống")
    @Size(max = 100, message = "Tên phường / xã tối đa 100 ký tự")
    @Column(nullable = false, length = 100)
    private String ward;

    @NotBlank(message = "Tỉnh / Thành phố không được để trống")
    @Size(max = 100, message = "Tên tỉnh / thành phố tối đa 100 ký tự")
    @Column(nullable = false, length = 100)
    private String province;

    @NotNull(message = "Trạng thái địa chỉ mặc định không được để trống")
    @Column(nullable = false)
    private Boolean isDefault = false;

    @NotNull(message = "Địa chỉ phải thuộc về một người dùng")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
}