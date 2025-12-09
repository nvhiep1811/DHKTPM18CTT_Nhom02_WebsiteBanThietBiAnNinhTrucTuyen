package secure_shop.backend.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import secure_shop.backend.dto.analytics.AnalyticsSummaryDTO;
import secure_shop.backend.service.AnalyticsService;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
@Slf4j
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/summary")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AnalyticsSummaryDTO> getAnalyticsSummary(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant endDate
    ) {
        log.info("Fetching analytics summary from {} to {}", startDate, endDate);

        // Default to last 30 days if no dates provided
        if (startDate == null || endDate == null) {
            endDate = Instant.now();
            startDate = endDate.minus(30, ChronoUnit.DAYS);
            log.info("No dates provided, defaulting to last 30 days: {} to {}", startDate, endDate);
        }

        try {
            AnalyticsSummaryDTO summary = analyticsService.getAnalyticsSummary(startDate, endDate);
            return ResponseEntity.ok(summary);
        } catch (IllegalArgumentException e) {
            log.error("Invalid date range: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Error fetching analytics summary", e);
            return ResponseEntity.internalServerError().build();
        }
    }
}
