package secure_shop.backend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import secure_shop.backend.dto.analytics.AnalyticsSummaryDTO;
import secure_shop.backend.dto.analytics.OrderStatusDistributionDTO;
import secure_shop.backend.dto.analytics.RevenueDataPointDTO;
import secure_shop.backend.dto.analytics.TopProductDTO;
import secure_shop.backend.enums.OrderStatus;
import secure_shop.backend.enums.PaymentStatus;
import secure_shop.backend.repositories.OrderItemRepository;
import secure_shop.backend.repositories.OrderRepository;
import secure_shop.backend.repositories.UserRepository;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.sql.Date;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class AnalyticsService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final UserRepository userRepository;

    private static final int MAX_DAYS_RANGE = 365;

    public AnalyticsSummaryDTO getAnalyticsSummary(Instant startDate, Instant endDate) {
        // Validate date range
        validateDateRange(startDate, endDate);

        // Check if there's any data
        Long totalOrders = orderRepository.countByCreatedAtBetween(startDate, endDate);
        boolean hasData = totalOrders != null && totalOrders > 0;

        if (!hasData) {
            return buildEmptyAnalytics();
        }

        // Calculate revenue metrics
        BigDecimal totalRevenue = orderRepository.calculateTotalRevenue(
                startDate, endDate, PaymentStatus.PAID
        );

        // Count orders by status
        Long pendingOrders = countPendingOrders(startDate, endDate);
        Long completedOrders = orderRepository.countByStatusAndCreatedAtBetween(
                OrderStatus.DELIVERED, startDate, endDate
        );
        Long cancelledOrders = orderRepository.countByStatusAndCreatedAtBetween(
                OrderStatus.CANCELLED, startDate, endDate
        );

        // Calculate average order value
        BigDecimal avgOrderValue = orderRepository.calculateAvgOrderValue(
                OrderStatus.DELIVERED, startDate, endDate
        );

        // Get user statistics
        Long totalUsers = userRepository.count();
        Long activeUsers = userRepository.countByDeletedAtIsNull();

        // Calculate conversion rate
        Double conversionRate = calculateConversionRate(completedOrders, activeUsers);

        // Get order status distribution
        List<OrderStatusDistributionDTO> orderStatusDistribution = getOrderStatusDistribution(
                startDate, endDate
        );

        // Get revenue trend (last 7 days within the range)
        List<RevenueDataPointDTO> revenueTrend = getRevenueTrend(startDate, endDate);

        // Get top 5 products
        List<TopProductDTO> topProducts = getTopProducts(startDate, endDate);

        return AnalyticsSummaryDTO.builder()
                .hasData(true)
                .totalRevenue(totalRevenue != null ? totalRevenue : BigDecimal.ZERO)
                .totalOrders(totalOrders)
                .pendingOrders(pendingOrders)
                .completedOrders(completedOrders)
                .cancelledOrders(cancelledOrders)
                .avgOrderValue(avgOrderValue != null ? avgOrderValue : BigDecimal.ZERO)
                .totalUsers(totalUsers)
                .activeUsers(activeUsers)
                .conversionRate(conversionRate)
                .orderStatusDistribution(orderStatusDistribution)
                .revenueTrend(revenueTrend)
                .topProducts(topProducts)
                .build();
    }

    private void validateDateRange(Instant startDate, Instant endDate) {
        long daysBetween = ChronoUnit.DAYS.between(startDate, endDate);
        if (daysBetween > MAX_DAYS_RANGE) {
            throw new IllegalArgumentException(
                    "Date range cannot exceed " + MAX_DAYS_RANGE + " days (1 year)"
            );
        }
        if (endDate.isBefore(startDate)) {
            throw new IllegalArgumentException("End date must be after start date");
        }
    }

    private Long countPendingOrders(Instant startDate, Instant endDate) {
        Long pending = orderRepository.countByStatusAndCreatedAtBetween(
                OrderStatus.PENDING, startDate, endDate
        );
        Long confirmed = orderRepository.countByStatusAndCreatedAtBetween(
                OrderStatus.CONFIRMED, startDate, endDate
        );
        Long waitingForDelivery = orderRepository.countByStatusAndCreatedAtBetween(
                OrderStatus.WAITING_FOR_DELIVERY, startDate, endDate
        );
        Long inTransit = orderRepository.countByStatusAndCreatedAtBetween(
                OrderStatus.IN_TRANSIT, startDate, endDate
        );

        return (pending != null ? pending : 0L) +
                (confirmed != null ? confirmed : 0L) +
                (waitingForDelivery != null ? waitingForDelivery : 0L) +
                (inTransit != null ? inTransit : 0L);
    }

    private Double calculateConversionRate(Long completedOrders, Long activeUsers) {
        if (activeUsers == null || activeUsers == 0) {
            return 0.0;
        }
        if (completedOrders == null) {
            return 0.0;
        }
        double rate = (completedOrders.doubleValue() / activeUsers.doubleValue()) * 100.0;
        return Math.round(rate * 100.0) / 100.0; // Round to 2 decimal places
    }

    private List<OrderStatusDistributionDTO> getOrderStatusDistribution(
            Instant startDate, Instant endDate
    ) {
        List<OrderStatusDistributionDTO> distribution = new ArrayList<>();

        for (OrderStatus status : OrderStatus.values()) {
            Long count = orderRepository.countByStatusAndCreatedAtBetween(
                    status, startDate, endDate
            );
            if (count != null && count > 0) {
                distribution.add(new OrderStatusDistributionDTO(status, count));
            }
        }

        return distribution;
    }

    private List<RevenueDataPointDTO> getRevenueTrend(Instant startDate, Instant endDate) {
        List<Object[]> dailyStats = orderRepository.getDailyRevenueStats(
                startDate, endDate, PaymentStatus.PAID
        );

        List<RevenueDataPointDTO> trend = new ArrayList<>();
        for (Object[] stat : dailyStats) {
            String dateStr;
            if (stat[0] instanceof Date) {
                dateStr = ((Date) stat[0]).toLocalDate().toString();
            } else if (stat[0] instanceof LocalDate) {
                dateStr = stat[0].toString();
            } else {
                dateStr = stat[0].toString();
            }

            BigDecimal revenue = stat[1] instanceof BigDecimal
                    ? (BigDecimal) stat[1]
                    : BigDecimal.valueOf(((Number) stat[1]).doubleValue());

            Long orderCount = stat[2] instanceof Long
                    ? (Long) stat[2]
                    : ((Number) stat[2]).longValue();

            trend.add(new RevenueDataPointDTO(dateStr, revenue, orderCount));
        }

        return trend;
    }

    private List<TopProductDTO> getTopProducts(Instant startDate, Instant endDate) {
        List<Object[]> topProductsData = orderItemRepository.findTopProductsBySales(
                startDate,
                endDate,
                PaymentStatus.PAID,
                PageRequest.of(0, 5)
        );

        List<TopProductDTO> topProducts = new ArrayList<>();
        for (Object[] data : topProductsData) {
            UUID productId = (UUID) data[0];
            String productName = (String) data[1];
            String thumbnailUrl = (String) data[2];

            Long totalQuantity = data[3] instanceof Long
                    ? (Long) data[3]
                    : ((Number) data[3]).longValue();

            BigDecimal totalRevenue = data[4] instanceof BigDecimal
                    ? (BigDecimal) data[4]
                    : BigDecimal.valueOf(((Number) data[4]).doubleValue());

            topProducts.add(new TopProductDTO(
                    productId,
                    productName,
                    thumbnailUrl,
                    totalQuantity,
                    totalRevenue
            ));
        }

        return topProducts;
    }

    private AnalyticsSummaryDTO buildEmptyAnalytics() {
        return AnalyticsSummaryDTO.builder()
                .hasData(false)
                .totalRevenue(BigDecimal.ZERO)
                .totalOrders(0L)
                .pendingOrders(0L)
                .completedOrders(0L)
                .cancelledOrders(0L)
                .avgOrderValue(BigDecimal.ZERO)
                .totalUsers(userRepository.count())
                .activeUsers(userRepository.countByDeletedAtIsNull())
                .conversionRate(0.0)
                .orderStatusDistribution(new ArrayList<>())
                .revenueTrend(new ArrayList<>())
                .topProducts(new ArrayList<>())
                .build();
    }
}
