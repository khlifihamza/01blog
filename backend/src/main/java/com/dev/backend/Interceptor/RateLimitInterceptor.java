package com.dev.backend.Interceptor;

import io.github.bucket4j.Bucket;
import io.github.bucket4j.ConsumptionProbe;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import com.dev.backend.config.RateLimitConfig;
import com.dev.backend.service.RateLimiterService;

@Component
public class RateLimitInterceptor implements HandlerInterceptor {

    private final RateLimiterService rateLimiterService;
    private final RateLimitConfig config;

    public RateLimitInterceptor(RateLimiterService rateLimiterService,
            RateLimitConfig config) {
        this.rateLimiterService = rateLimiterService;
        this.config = config;
    }

    @Override
    public boolean preHandle(HttpServletRequest request,
            HttpServletResponse response,
            Object handler) throws Exception {

        if (!config.isEnabled()) {
            return true;
        }

        String clientIp = getClientIp(request);
        Bucket bucket = rateLimiterService.resolveBucket(clientIp);
        ConsumptionProbe probe = bucket.tryConsumeAndReturnRemaining(1);

        response.setHeader("X-RateLimit-Limit", String.valueOf(config.getCapacity()));
        response.setHeader("X-RateLimit-Remaining", String.valueOf(probe.getRemainingTokens()));

        if (!probe.isConsumed()) {
            long waitForRefill = probe.getNanosToWaitForRefill() / 1_000_000_000;
            response.setHeader("X-RateLimit-Retry-After-Seconds", String.valueOf(waitForRefill));
            response.setHeader("Retry-After", String.valueOf(waitForRefill));
            sendRateLimitResponse(response, clientIp, waitForRefill);
            return false;
        }

        rateLimiterService.cleanup();

        return true;
    }

    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");

        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("X-Real-IP");
        }

        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }

        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("WL-Proxy-Client-IP");
        }

        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }

        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }

        return ip != null ? ip : "unknown";
    }

    private void sendRateLimitResponse(HttpServletResponse response,
            String clientIp,
            long retryAfter) throws Exception {
        response.setStatus(429);
        response.setContentType("application/json");
        response.getWriter().write(String.format(
                "{\"error\":\"Too Many Requests\",\"message\":\"Rate limit exceeded for IP: %s\",\"retryAfter\":%d}",
                clientIp, retryAfter));
    }
}