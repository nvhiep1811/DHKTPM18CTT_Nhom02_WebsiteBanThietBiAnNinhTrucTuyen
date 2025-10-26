package secure_shop.backend.entities;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Entity
@Table(name = "users", uniqueConstraints = @UniqueConstraint(columnNames = "email"))
public class User {

    @Id
    @GeneratedValue
    @EqualsAndHashCode.Include
    private UUID id;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    @Column(unique = true, nullable = false, columnDefinition = "text")
    private String email;

    @Column(columnDefinition = "text", nullable = false)
    private String name;

    @JsonProperty("avatar_url")
    @Column(columnDefinition = "text")
    private String avatarUrl;

    @Column(columnDefinition = "text")
    private String provider;

    @Size(min = 8, message = "Password length must be at least 8 characters")
    @JsonProperty("password_hash")
    @Column(columnDefinition = "text")
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "text")
    private Role role;

    @PrePersist
    void beforeInsert() {
        this.createdAt = Instant.now();
        if (role == null) {
            role = Role.USER;
        }
    }
}