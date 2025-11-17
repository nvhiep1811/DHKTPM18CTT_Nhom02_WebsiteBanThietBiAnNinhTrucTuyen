package secure_shop.backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import secure_shop.backend.dto.chat.ChatRequest;
import secure_shop.backend.dto.chat.ChatResponse;
import secure_shop.backend.service.ChatService;
import secure_shop.backend.service.VectorIngestionService;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;
    private final VectorIngestionService ingestionService;

    @PostMapping("/ask")
    @PreAuthorize("permitAll()")
    public ResponseEntity<ChatResponse> ask(@Valid @RequestBody ChatRequest request) {
        return ResponseEntity.ok(chatService.chat(request));
    }

    @PostMapping("/ingest")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> ingest() {
        ingestionService.ingestPoliciesAndTopProducts();
        return ResponseEntity.ok("Ingestion triggered");
    }
}
