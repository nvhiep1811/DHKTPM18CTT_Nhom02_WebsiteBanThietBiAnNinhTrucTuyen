package secure_shop.backend.security.jwt;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.auth0.jwt.interfaces.JWTVerifier;
import lombok.SneakyThrows;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import secure_shop.backend.entities.User;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.security.KeyFactory;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.time.Instant;
import java.util.Base64;
import java.util.Date;

@Service
public class JwtService {

    private final RSAPrivateKey privateKey;
    private final RSAPublicKey publicKey;
    private final Algorithm algorithm;
    private final String issuer;

    private final long accessExpSec;
    private final long refreshExpSec;

    public JwtService(
            @Value("${jwt.private-key-file}") Resource privateKeyRes,
            @Value("${jwt.public-key-file}") Resource publicKeyRes,
            @Value("${jwt.access-token-expire-seconds}") long accessExpSec,
            @Value("${jwt.refresh-token-expire-seconds}") long refreshExpSec,
            @Value("${jwt.issuer}") String issuer
    ) throws Exception {
        this.privateKey = (RSAPrivateKey) readPrivateKey(privateKeyRes);
        this.publicKey = (RSAPublicKey) readPublicKey(publicKeyRes);
        this.algorithm = Algorithm.RSA256(publicKey, privateKey);
        this.issuer = issuer;
        this.accessExpSec = accessExpSec;
        this.refreshExpSec = refreshExpSec;
    }

    //  Read Key
    private RSAPublicKey readPublicKey(Resource res) throws Exception {
        String pem = new String(res.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
        String content = pem
                .replace("-----BEGIN PUBLIC KEY-----", "")
                .replace("-----END PUBLIC KEY-----", "")
                .replaceAll("\\s+", "");
        byte[] decoded = Base64.getDecoder().decode(content);
        X509EncodedKeySpec keySpec = new X509EncodedKeySpec(decoded);
        return (RSAPublicKey) KeyFactory.getInstance("RSA").generatePublic(keySpec);
    }

    private RSAPrivateKey readPrivateKey(Resource res) throws Exception {
        String pem = new String(res.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
        String content = pem
                .replace("-----BEGIN PRIVATE KEY-----", "")
                .replace("-----END PRIVATE KEY-----", "")
                .replaceAll("\\s+", "");
        byte[] decoded = Base64.getDecoder().decode(content);
        PKCS8EncodedKeySpec keySpec = new PKCS8EncodedKeySpec(decoded);
        return (RSAPrivateKey) KeyFactory.getInstance("RSA").generatePrivate(keySpec);
    }

    //    Generate tokens
    public String generateAccessToken(User user) {
        Instant now = Instant.now();
        return JWT.create()
                .withIssuer(issuer)
                .withSubject(user.getId().toString())
                .withClaim("email", user.getEmail())
                .withClaim("role", user.getRole() != null ? user.getRole().name() : "USER")
                .withIssuedAt(Date.from(now))
                .withExpiresAt(Date.from(now.plusSeconds(accessExpSec)))
                .sign(algorithm);
    }

    public String generateRefreshToken(User user) {
        Instant now = Instant.now();
        return JWT.create()
                .withIssuer(issuer)
                .withSubject(user.getId().toString())
                .withClaim("type", "refresh")
                .withIssuedAt(Date.from(now))
                .withExpiresAt(Date.from(now.plusSeconds(refreshExpSec)))
                .sign(algorithm);
    }

//    Validate / parse
    public DecodedJWT verify(String token) {
        JWTVerifier verifier = JWT.require(algorithm)
                .withIssuer(issuer)
                .build();
        return verifier.verify(token);
    }

    public String getSubject(String token) {
        return verify(token).getSubject();
    }

    public String extractUsername(String token) {
        return verify(token).getSubject();
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        try {
            DecodedJWT jwt = verify(token);
            return jwt.getSubject().equals(userDetails.getUsername())
                    && !isExpired(jwt);
        } catch (Exception e) {
            return false;
        }
    }

    private boolean isExpired(DecodedJWT jwt) {
        return jwt.getExpiresAt().before(new Date());
    }

    public long getAccessExpSeconds() {
        return accessExpSec;
    }

    public long getRefreshExpSeconds() {
        return refreshExpSec;
    }
}
