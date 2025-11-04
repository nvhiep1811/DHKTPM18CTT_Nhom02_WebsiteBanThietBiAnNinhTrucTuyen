package secure_shop.backend.dto.user;

import java.util.UUID;

public record UserProfileDTO(
        UUID id,
        String email,
        String name,
        String phone,
        String avatarUrl,
        String role
) {
    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private UUID id;
        private String email;
        private String name;
        private String phone;
        private String avatarUrl;
        private String role;

        private Builder() {}

        public Builder id(UUID id) {
            this.id = id;
            return this;
        }

        public Builder email(String email) {
            this.email = email;
            return this;
        }

        public Builder name(String name) {
            this.name = name;
            return this;
        }

        public Builder phone(String phone) {
            this.phone = phone;
            return this;
        }

        public Builder avatarUrl(String avatarUrl) {
            this.avatarUrl = avatarUrl;
            return this;
        }

        public Builder role(String role) {
            this.role = role;
            return this;
        }

        public UserProfileDTO build() {
            return new UserProfileDTO(id, email, name, phone, avatarUrl, role);
        }
    }
}