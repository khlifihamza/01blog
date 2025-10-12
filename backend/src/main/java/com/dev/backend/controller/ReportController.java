package com.dev.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dev.backend.dto.ApiResponse;
import com.dev.backend.dto.ReportRequest;
import com.dev.backend.model.User;
import com.dev.backend.service.ReportService;

@RestController
@RequestMapping("/api/report")
public class ReportController {
    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @PostMapping("/create")
    public ResponseEntity<ApiResponse> createReport(@Validated @RequestBody ReportRequest reportDto,
            @AuthenticationPrincipal User currentUser) {
        reportService.saveReport(reportDto, currentUser);
        return ResponseEntity.ok(new ApiResponse("Report created successfully"));
    }
}
