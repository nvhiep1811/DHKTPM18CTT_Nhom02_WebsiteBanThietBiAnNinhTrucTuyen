package secure_shop.backend.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import secure_shop.backend.dto.product.ReviewDTO;
import secure_shop.backend.entities.OrderItem;
import secure_shop.backend.entities.Product;
import secure_shop.backend.entities.Review;
import secure_shop.backend.entities.User;
import secure_shop.backend.enums.OrderStatus;
import secure_shop.backend.enums.ReviewStatus;
import secure_shop.backend.exception.ResourceNotFoundException;
import secure_shop.backend.exception.UnauthorizedException;
import secure_shop.backend.mapper.ReviewMapper;
import secure_shop.backend.repositories.OrderItemRepository;
import secure_shop.backend.repositories.ProductRepository;
import secure_shop.backend.repositories.ReviewRepository;
import secure_shop.backend.repositories.UserRepository;
import secure_shop.backend.service.ReviewService;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final ReviewMapper reviewMapper;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final OrderItemRepository orderItemRepository;

    @Override
    public ReviewDTO createReview(ReviewDTO reviewDTO) {
        // Validate user exists
        User user = userRepository.findById(reviewDTO.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User", reviewDTO.getUserId()));

        // Validate product exists
        Product product = productRepository.findById(reviewDTO.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product", reviewDTO.getProductId()));

        // FIXED: If orderItem is provided, use that specific order item
        OrderItem orderItem;
        if (reviewDTO.getOrderItem() != null) {
            orderItem = orderItemRepository.findById(reviewDTO.getOrderItem())
                    .orElseThrow(() -> new ResourceNotFoundException("OrderItem", reviewDTO.getOrderItem()));

            // Verify the order item belongs to the user and product
            if (!orderItem.getOrder().getUser().getId().equals(user.getId())) {
                throw new UnauthorizedException("Order item không thuộc về bạn");
            }

            if (!orderItem.getProduct().getId().equals(product.getId())) {
                throw new UnauthorizedException("Order item không chứa sản phẩm này");
            }

            if (orderItem.getOrder().getStatus() != OrderStatus.DELIVERED) {
                throw new UnauthorizedException("Chỉ có thể đánh giá đơn hàng đã giao");
            }
        } else {
            // Legacy: Find any delivered order item (not recommended)
            orderItem = orderItemRepository
                    .findByUserAndProductAndOrderStatus(
                            user.getId(),
                            product.getId(),
                            OrderStatus.DELIVERED
                    )
                    .stream()
                    .filter(oi -> !reviewRepository.existsByOrderItemId(oi.getId()))
                    .findFirst()
                    .orElseThrow(() -> new UnauthorizedException(
                            "Bạn chỉ có thể đánh giá sản phẩm đã mua và đã nhận hàng"));
        }

        // Check if user already reviewed this specific order item
        if (reviewRepository.existsByOrderItemId(orderItem.getId())) {
            throw new UnauthorizedException("Bạn đã đánh giá sản phẩm này rồi");
        }

        // Create review
        Review review = reviewMapper.toEntity(reviewDTO);
        review.setStatus(ReviewStatus.PENDING);
        review.setProduct(product);
        review.setUser(user);
        review.setOrderItem(orderItem);

        Review savedReview = reviewRepository.save(review);

        // Update product rating (will only count if approved)
        updateProductRating(product.getId());

        return reviewMapper.toDTO(savedReview);
    }

    @Override
    public ReviewDTO updateReview(Long id, ReviewDTO reviewDTO) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review", id));

        // Only allow updating if status is PENDING
        if (review.getStatus() != ReviewStatus.PENDING) {
            throw new UnauthorizedException("Không thể chỉnh sửa đánh giá đã được duyệt hoặc từ chối");
        }

        reviewMapper.updateEntityFromDTO(reviewDTO, review);
        Review updatedReview = reviewRepository.save(review);

        return reviewMapper.toDTO(updatedReview);
    }

    @Override
    public void deleteReview(Long id) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review", id));

        UUID productId = review.getProduct().getId();
        reviewRepository.deleteById(id);

        // Update product rating after deletion
        updateProductRating(productId);
    }

    @Override
    @Transactional(readOnly = true)
    public ReviewDTO getReviewById(Long id) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review", id));
        return reviewMapper.toDTO(review);
    }

    @Transactional(readOnly = true)
    @Override
    public List<ReviewDTO> getAllReviews() {
        return reviewRepository.findAll().stream()
                .map(reviewMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ReviewDTO> getReviewsPage(Pageable pageable) {
        return reviewRepository.findAll(pageable)
                .map(reviewMapper::toDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReviewDTO> getReviewsByProductId(UUID productId) {
        // Verify product exists
        if (!productRepository.existsById(productId)) {
            throw new ResourceNotFoundException("Product", productId);
        }

        return reviewRepository.findByProductId(productId).stream()
                .map(reviewMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReviewDTO> getReviewsByUserId(UUID userId) {
        // Verify user exists
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User", userId);
        }

        return reviewRepository.findByUserId(userId).stream()
                .map(reviewMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public ReviewDTO approveReview(Long id) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review", id));

        review.setStatus(ReviewStatus.APPROVED);
        Review updatedReview = reviewRepository.save(review);

        // Update product rating (now includes this review)
        updateProductRating(review.getProduct().getId());

        return reviewMapper.toDTO(updatedReview);
    }

    @Override
    public ReviewDTO rejectReview(Long id) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review", id));

        review.setStatus(ReviewStatus.REJECTED);
        Review updatedReview = reviewRepository.save(review);

        // Update product rating (excludes rejected reviews)
        updateProductRating(review.getProduct().getId());

        return reviewMapper.toDTO(updatedReview);
    }

    /**
     * Update product rating based on approved reviews only
     */
    private void updateProductRating(UUID productId) {
        List<Review> approvedReviews = reviewRepository
                .findByProductIdAndStatus(productId, ReviewStatus.APPROVED);

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", productId));

        if (approvedReviews.isEmpty()) {
            product.setRating(0.0);
            product.setReviewCount(0);
        } else {
            double avgRating = approvedReviews.stream()
                    .mapToInt(Review::getRating)
                    .average()
                    .orElse(0.0);

            // Round to 1 decimal place
            product.setRating(Math.round(avgRating * 10.0) / 10.0);
            product.setReviewCount(approvedReviews.size());
        }

        productRepository.save(product);
    }
}