package secure_shop.backend.config.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.JdkSerializationRedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;
import org.springframework.security.oauth2.client.web.AuthorizationRequestRepository;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.concurrent.TimeUnit;

@Component
@Slf4j
public class RedisOAuth2AuthorizationRequestRepository implements AuthorizationRequestRepository<OAuth2AuthorizationRequest> {

    private static final String OAUTH2_AUTH_REQUEST_PREFIX = "oauth2:auth_request:";
    private static final String STATE_PARAM_NAME = "state";
    private static final long EXPIRATION_MINUTES = 10; // OAuth2 state expires in 10 minutes

    private final RedisTemplate<String, OAuth2AuthorizationRequest> redisTemplate;

    public RedisOAuth2AuthorizationRequestRepository(RedisConnectionFactory redisConnectionFactory) {
        // Create a dedicated RedisTemplate for OAuth2AuthorizationRequest
        RedisTemplate<String, OAuth2AuthorizationRequest> template = new RedisTemplate<>();
        template.setConnectionFactory(redisConnectionFactory);
        
        // Use String serializer for keys
        template.setKeySerializer(new StringRedisSerializer());
        
        // Use JDK serialization for OAuth2AuthorizationRequest values
        template.setValueSerializer(new JdkSerializationRedisSerializer());
        
        template.afterPropertiesSet();
        this.redisTemplate = template;
    }

    @Override
    public OAuth2AuthorizationRequest loadAuthorizationRequest(HttpServletRequest request) {
        String state = getStateParameter(request);
        if (state == null) {
            return null;
        }

        String key = OAUTH2_AUTH_REQUEST_PREFIX + state;
        OAuth2AuthorizationRequest authRequest = redisTemplate.opsForValue().get(key);
        
        if (authRequest != null) {
            log.debug("Loaded OAuth2 authorization request for state: {}", state);
        }
        
        return authRequest;
    }

    @Override
    public void saveAuthorizationRequest(OAuth2AuthorizationRequest authorizationRequest, 
                                        HttpServletRequest request, 
                                        HttpServletResponse response) {
        if (authorizationRequest == null) {
            removeAuthorizationRequest(request, response);
            return;
        }

        String state = authorizationRequest.getState();
        if (!StringUtils.hasText(state)) {
            log.warn("Cannot save OAuth2 authorization request without state parameter");
            return;
        }

        String key = OAUTH2_AUTH_REQUEST_PREFIX + state;
        redisTemplate.opsForValue().set(key, authorizationRequest, EXPIRATION_MINUTES, TimeUnit.MINUTES);
        log.debug("Saved OAuth2 authorization request for state: {} (expires in {} minutes)", state, EXPIRATION_MINUTES);
    }

    @Override
    public OAuth2AuthorizationRequest removeAuthorizationRequest(HttpServletRequest request, 
                                                                 HttpServletResponse response) {
        String state = getStateParameter(request);
        if (state == null) {
            return null;
        }

        String key = OAUTH2_AUTH_REQUEST_PREFIX + state;
        OAuth2AuthorizationRequest authRequest = redisTemplate.opsForValue().get(key);
        
        if (authRequest != null) {
            redisTemplate.delete(key);
            log.debug("Removed OAuth2 authorization request for state: {}", state);
        }
        
        return authRequest;
    }

    private String getStateParameter(HttpServletRequest request) {
        return request.getParameter(STATE_PARAM_NAME);
    }
}
