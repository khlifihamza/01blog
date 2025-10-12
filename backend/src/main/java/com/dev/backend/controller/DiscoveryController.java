package com.dev.backend.controller;

import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.dev.backend.dto.DiscoveryResponse;
import com.dev.backend.model.User;
import com.dev.backend.service.DiscoveryService;

@RestController
@RequestMapping("/api/discovery")
public class DiscoveryController {
        private final DiscoveryService discoveryService;

        public DiscoveryController(DiscoveryService discoveryService) {
                this.discoveryService = discoveryService;
        }

        @GetMapping("suggest")
        public ResponseEntity<DiscoveryResponse> getDiscoveryData(
                        @AuthenticationPrincipal User currentUser) {
                DiscoveryResponse discoveryResponse = discoveryService.getDiscoveryData(currentUser.getId());
                return ResponseEntity.ok(discoveryResponse);
        }

        @GetMapping("search")
        public ResponseEntity<DiscoveryResponse> searchData(@RequestParam String query,
                        @AuthenticationPrincipal User currentUser, @RequestParam(defaultValue = "0") int page,
                        @RequestParam(defaultValue = "10") int size) {
                DiscoveryResponse discoveryResponse = discoveryService.getSearchedData(currentUser.getId(), query,
                                PageRequest.of(page, size));
                return ResponseEntity.ok(discoveryResponse);
        }
}
