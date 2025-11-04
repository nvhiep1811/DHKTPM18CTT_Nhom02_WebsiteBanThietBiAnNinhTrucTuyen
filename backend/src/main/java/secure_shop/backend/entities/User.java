package secure_shop.backend.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import secure_shop.backend.enums.Role;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(
        name = "users",
        indexes = {
                @Index(name = "idx_users_email", columnList = "email"),
                @Index(name = "idx_users_role", columnList = "role"),
                @Index(name = "idx_users_enabled", columnList = "enabled")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User extends BaseEntity {

    @Email(message = "Email không hợp lệ")
    @NotBlank(message = "Email không được để trống")
    @Size(max = 255, message = "Email tối đa 255 ký tự")
    @Column(nullable = false, unique = true)
    private String email;

    @Size(min = 8, max = 255, message = "Mật khẩu phải từ 8 đến 255 ký tự")
    @Column(nullable = false)
    private String passwordHash;

    @NotBlank(message = "Tên người dùng không được để trống")
    @Size(max = 255, message = "Tên tối đa 255 ký tự")
    @Column(nullable = false)
    private String name;

    @Pattern(regexp = "^(\\+\\d{1,3}[- ]?)?\\d{9,15}$", message = "Số điện thoại không hợp lệ")
    @Column(length = 20)
    private String phone;

    @Builder.Default
    @Column(nullable = false)
    private Boolean enabled = true;

    @Size(max = 2048, message = "Đường dẫn ảnh quá dài")
    @Pattern(
            regexp = "^(https?:\\/\\/)?([\\w\\-]+\\.)+[\\w\\-]+(\\/.*)?$",
            message = "URL ảnh đại diện không hợp lệ"
    )
    @Column(columnDefinition = "TEXT")
    private String avatarUrl;

    @Pattern(regexp = "local|google|facebook", message = "Provider không hợp lệ")
    @Column(length = 50)
    @Builder.Default
    private String provider = "local";

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private Role role = Role.USER;

    private Instant deletedAt;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private Set<Review> reviews = new HashSet<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private Set<SupportTicket> supportTickets = new HashSet<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    @Builder.Default
    private Set<Order> orders = new HashSet<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private Set<Address> addresses = new HashSet<>();
}