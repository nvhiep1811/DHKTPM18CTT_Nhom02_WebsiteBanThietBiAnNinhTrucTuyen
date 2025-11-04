package secure_shop.backend.service;

public interface VerificationService {
    void sendVerificationEmail(String email, String userId);
    boolean verifyEmail(String token);
    void resendVerificationEmail(String email);
}