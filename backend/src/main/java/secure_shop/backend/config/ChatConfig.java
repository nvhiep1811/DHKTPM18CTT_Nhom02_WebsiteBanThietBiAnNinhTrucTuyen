package secure_shop.backend.config;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ChatConfig {

    @Bean
    public ChatClient chatClient(@Autowired(required = false) ChatModel chatModel) {
        if (chatModel == null) {
            return null;
        }
        return ChatClient.builder(chatModel).build();
    }
}
