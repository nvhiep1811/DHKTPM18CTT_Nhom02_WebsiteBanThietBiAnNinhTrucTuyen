package secure_shop.backend.dto.chat;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class ChatResponse {
    private String answer;
    private List<ProductSuggestion> suggestions;

    @Data
    @Builder
    public static class ProductSuggestion {
        private String id;
        private String name;
        private String sku;
        private Double rating;
        private Integer reviewCount;
        private String thumbnailUrl;
        private String price; // formatted
    }
}
