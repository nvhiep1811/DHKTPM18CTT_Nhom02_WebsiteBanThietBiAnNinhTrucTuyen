package secure_shop.backend.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.stereotype.Service;
import secure_shop.backend.entities.Product;
import secure_shop.backend.repositories.ProductRepository;
import secure_shop.backend.service.VectorIngestionService;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class VectorIngestionServiceImpl implements VectorIngestionService {

    private final VectorStore vectorStore;
    private final ProductRepository productRepository;

    @Override
    public void ingestPoliciesAndTopProducts() {
        List<Product> top = productRepository.findTop5ByActiveTrueOrderByReviewCountDesc();
        List<Document> docs = new ArrayList<>();

        // Policies (static for now)
        docs.add(new Document("Chính sách giao hàng: thời gian dự kiến 2-5 ngày làm việc trong nước. Có hỗ trợ tracking.", Map.of("type", "policy", "topic", "shipping")));
        docs.add(new Document("Chính sách đổi trả: Bạn có thể đổi hoặc trả trong vòng 7 ngày nếu sản phẩm còn nguyên vẹn, đầy đủ tem mác.", Map.of("type", "policy", "topic", "return")));
        docs.add(new Document("Bảo hành: Thời gian bảo hành tùy loại sản phẩm từ 1 đến 24 tháng, áp dụng theo chính sách hãng.", Map.of("type", "policy", "topic", "warranty")));
        docs.add(new Document("Hướng dẫn đặt hàng: Chọn sản phẩm -> Thêm vào giỏ -> Kiểm tra giỏ -> Nhập địa chỉ & phương thức thanh toán -> Xác nhận -> Nhận email xác nhận.", Map.of("type", "policy", "topic", "ordering")));

        // Products
        docs.addAll(top.stream().map(p -> new Document(
                buildProductText(p),
                Map.of(
                        "type", "product",
                        "id", p.getId().toString(),
                        "name", p.getName(),
                        "sku", p.getSku(),
                        "rating", String.valueOf(p.getRating()),
                        "reviews", String.valueOf(p.getReviewCount())
                )
        )).collect(Collectors.toList()));

        vectorStore.add(docs);
        log.info("Indexed {} documents into vector store", docs.size());
    }

    private String buildProductText(Product p) {
        return String.format("Sản phẩm %s (SKU %s) giá %s, đánh giá %.1f với %d lượt đánh giá. Mô tả ngắn: %s",
                p.getName(), p.getSku(), p.getPrice(), p.getRating(), p.getReviewCount(), Optional.ofNullable(p.getShortDesc()).orElse("(không có)"));
    }
}
