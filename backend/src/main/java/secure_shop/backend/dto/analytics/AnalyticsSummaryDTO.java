package secure_shop.backend.dto.analytics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnalyticsSummaryDTO implements Serializable {
    private Boolean hasData;
    private BigDecimal totalRevenue;
    private Long totalOrders;
    private Long pendingOrders;
    private Long completedOrders;
    private Long cancelledOrders;
    private BigDecimal avgOrderValue;
    private Long totalUsers;
    private Long activeUsers;
    private Double conversionRate;
    private List<OrderStatusDistributionDTO> orderStatusDistribution;
    private List<RevenueDataPointDTO> revenueTrend;
    private List<TopProductDTO> topProducts;
}
