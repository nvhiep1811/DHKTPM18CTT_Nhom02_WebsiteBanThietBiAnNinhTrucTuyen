package secure_shop.backend.service;

import secure_shop.backend.dto.chat.ChatRequest;
import secure_shop.backend.dto.chat.ChatResponse;

public interface ChatService {
    ChatResponse chat(ChatRequest request);
}
