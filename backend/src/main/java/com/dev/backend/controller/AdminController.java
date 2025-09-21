package com.dev.backend.controller;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dev.backend.dto.ReportResponse;
import com.dev.backend.model.Report;
import com.dev.backend.service.ReportService;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
    @Autowired
    private ReportService reportService;

    @GetMapping("/get-reports")
    public ResponseEntity<List<ReportResponse>> getReports() {
        List<Report> reports = reportService.getReports();
        List<ReportResponse> reportsResponses = new ArrayList<>();
        for (Report report : reports) {
            ReportResponse reportResponse = new ReportResponse(report.getId(),
                    report.getReported_post() == null ? null : report.getReported_post().getId(),
                    report.getReported_post() == null ? null : report.getReported_post().getTitle(),
                    report.getReported_user() == null ? null : report.getReported_user().getUsername(),
                    report.getReporter().getUsername(), report.getReason(),
                    report.getDetails(), report.getStatus(), report.getCreatedAt().toString());
            reportsResponses.add(reportResponse);
        }
        return ResponseEntity.ok(reportsResponses);
    }
}
