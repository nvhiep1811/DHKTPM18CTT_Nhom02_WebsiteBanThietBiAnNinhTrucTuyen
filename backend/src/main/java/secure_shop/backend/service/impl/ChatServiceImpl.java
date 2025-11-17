package secure_shop.backend.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import secure_shop.backend.dto.chat.ChatRequest;
import secure_shop.backend.dto.chat.ChatResponse;
import secure_shop.backend.entities.Product;
import secure_shop.backend.repositories.ProductRepository;
import secure_shop.backend.service.ChatService;

import java.math.BigDecimal;
import java.text.NumberFormat;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatServiceImpl implements ChatService {

    private final ProductRepository productRepository;
    @Autowired(required = false)
    private VectorStore vectorStore; // optional RAG
    @Autowired(required = false)
    private ChatClient chatClient; // optional - if OpenAI key not set, heuristic only

    @Override
    public ChatResponse chat(ChatRequest request) {
        String userMsg = request.getMessage().trim();
        List<Product> topProducts = productRepository.findTop5ByActiveTrueOrderByReviewCountDesc();

        List<ChatResponse.ProductSuggestion> suggestions = topProducts.stream().map(p -> ChatResponse.ProductSuggestion.builder()
                .id(p.getId().toString())
                .name(p.getName())
                .sku(p.getSku())
                .rating(p.getRating())
                .reviewCount(p.getReviewCount())
                .thumbnailUrl(p.getThumbnailUrl())
                .price(formatCurrency(p.getPrice()))
                .build()).collect(Collectors.toList());

        String heuristicAnswer = heuristic(userMsg, suggestions);

        // If no AI client available or heuristic sufficiently answers
        if (chatClient == null || shouldSkipLLM(userMsg)) {
            return ChatResponse.builder()
                    .answer(heuristicAnswer)
                    .suggestions(filterSuggestions(userMsg, suggestions))
                    .build();
        }

        String systemContext = buildSystemContext(suggestions, userMsg);
        try {
            String aiAnswer = chatClient.prompt()
                    .system(systemContext)
                    .user(userMsg)
                    .call()
                    .content();
            return ChatResponse.builder()
                    .answer(aiAnswer)
                    .suggestions(filterSuggestions(userMsg, suggestions))
                    .build();
        } catch (Exception ex) {
            log.warn("AI call failed, fallback heuristic: {}", ex.getMessage());
            return ChatResponse.builder()
                    .answer(heuristicAnswer)
                    .suggestions(filterSuggestions(userMsg, suggestions))
                    .build();
        }
    }

    private String buildSystemContext(List<ChatResponse.ProductSuggestion> suggestions, String userMsg) {
        String productLines = suggestions.stream()
                .map(s -> String.format("- %s (SKU %s, %s, rating %.1f, %d reviews)",
                        s.getName(), s.getSku(), s.getPrice(), s.getRating(), s.getReviewCount()))
                .collect(Collectors.joining("\n"));

        StringBuilder ragContext = new StringBuilder();
        if (vectorStore != null) {
            try {
                List<Document> docs = vectorStore.similaritySearch(
                        SearchRequest.builder()
                                .query(userMsg)
                                .topK(5)
                                .build()
                );
                if (!docs.isEmpty()) {
                    ragContext.append("\nNội dung tham chiếu:\n");
                    for (Document d : docs) {
                        ragContext.append("- ").append(String.valueOf(d)).append("\n");
                    }
                }
            } catch (Exception e) {
                log.debug("Vector search failed: {}", e.getMessage());
            }
        }

        return "Bạn là trợ lý hỗ trợ khách hàng cho website bán hàng. Trả lời ngắn gọn, tiếng Việt, không bịa.\n" +
                "Sản phẩm phổ biến:\n" + productLines + ragContext +
                "Nếu câu hỏi không liên quan hãy mời người dùng mô tả rõ hơn.";
    }

    private boolean shouldSkipLLM(String userMsg) {
        String lower = userMsg.toLowerCase(Locale.ROOT);
        return lower.contains("chính sách") || lower.contains("đặt hàng") || lower.contains("bán chạy") || lower.contains("phù hợp");
    }

    private String heuristic(String msg, List<ChatResponse.ProductSuggestion> suggestions) {
        String lower = msg.toLowerCase(Locale.ROOT);
        if (lower.contains("chính sách")) {
            return "Chính sách: Giao hàng 2-5 ngày làm việc, miễn phí đổi trả trong 7 ngày nếu sản phẩm còn nguyên vẹn, bảo hành chính hãng (thời gian tùy dòng sản phẩm).";
        }
        if (lower.contains("đặt hàng") || lower.contains("cách đặt")) {
            return "Cách đặt hàng: 1) Chọn sản phẩm và thêm vào giỏ. 2) Vào giỏ kiểm tra số lượng. 3) Nhấn Thanh toán, nhập địa chỉ và chọn phương thức thanh toán. 4) Xác nhận đơn hàng. Bạn sẽ nhận email xác nhận.";
        }
        if (lower.contains("bán chạy") || lower.contains("phổ biến") || lower.contains("top")) {
            return "Các sản phẩm được nhiều đánh giá: " + suggestions.stream().map(ChatResponse.ProductSuggestion::getName).collect(Collectors.joining(", ")) + ".";
        }
        if (lower.contains("phù hợp") || lower.contains("nên mua")) {
            return "Bạn có thể cho biết ngân sách hoặc nhu cầu (ví dụ: chơi game, văn phòng, gia dụng)? Tạm thời gợi ý: " + suggestions.stream().limit(3).map(ChatResponse.ProductSuggestion::getName).collect(Collectors.joining(", ")) + ".";
        }
        return "Tôi có thể hỗ trợ về sản phẩm, chính sách, cách đặt hàng. Bạn muốn hỏi cụ thể điều gì?";
    }

    private List<ChatResponse.ProductSuggestion> filterSuggestions(String userMsg, List<ChatResponse.ProductSuggestion> all) {
        String lower = userMsg.toLowerCase(Locale.ROOT);
        if (lower.contains("bán chạy") || lower.contains("phổ biến") || lower.contains("top") || lower.contains("phù hợp")) {
            return all; // return top list
        }
        return new ArrayList<>();
    }

    private String formatCurrency(BigDecimal amount) {
        if (amount == null) return "0₫";
        NumberFormat nf = NumberFormat.getCurrencyInstance(new Locale("vi", "VN"));
        return nf.format(amount);
    }
}
