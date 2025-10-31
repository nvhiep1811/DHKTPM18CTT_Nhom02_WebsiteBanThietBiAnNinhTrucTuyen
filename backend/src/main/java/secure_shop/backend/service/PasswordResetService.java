package secure_shop.backend.service;

public interface PasswordResetService {
    void sendResetLink(String email);
    void sendResetMailAsync(String email, String link);
    boolean verifyToken(String rawToken);
    boolean resetPassword(String rawToken, String newPassword);
}
