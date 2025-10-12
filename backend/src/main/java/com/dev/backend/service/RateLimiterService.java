package com.dev.backend.service;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import org.springframework.stereotype.Service;

import com.dev.backend.config.RateLimitConfig;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RateLimiterService {

    private final Map<String, Bucket> ipBucketCache = new ConcurrentHashMap<>();
    private final RateLimitConfig config;

    public RateLimiterService(RateLimitConfig config) {
        this.config = config;
    }

    public Bucket resolveBucket(String ip) {
        return ipBucketCache.computeIfAbsent(ip, key -> createBucket());
    }

    private Bucket createBucket() {
        Bandwidth limit = Bandwidth.builder()
                .capacity(config.getCapacity())
                .refillIntervally(config.getTokens(),
                        Duration.ofSeconds(config.getWindowSeconds()))
                .build();

        return Bucket.builder()
                .addLimit(limit)
                .build();
    }

    public void cleanup() {
        if (ipBucketCache.size() > 10000) {
            ipBucketCache.clear();
        }
    }

    public int getCacheSize() {
        return ipBucketCache.size();
    }
}