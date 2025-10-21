package com.dev.backend.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import com.dev.backend.dto.ReportRequest;
import com.dev.backend.dto.ReportResponse;
import com.dev.backend.model.Post;
import com.dev.backend.model.Report;
import com.dev.backend.model.ReportStatus;
import com.dev.backend.model.User;
import com.dev.backend.repository.PostRepository;
import com.dev.backend.repository.ReportRepository;
import com.dev.backend.repository.UserRepository;

import jakarta.persistence.EntityNotFoundException;

@Service
public class ReportService {
    private final ReportRepository reportRepository;

    private final PostRepository postRepository;

    private final UserRepository userRepository;

    @Autowired
    public ReportService(ReportRepository reportRepository, PostRepository postRepository,
            UserRepository userRepository) {
        this.postRepository = postRepository;
        this.reportRepository = reportRepository;
        this.userRepository = userRepository;
    }

    public void saveReport(ReportRequest reportDto, User reporterUser) {
        Report report = new Report();
        report.setReason(reportDto.reason());
        report.setDetails(reportDto.details());
        report.setReporter(reporterUser);
        report.setStatus(ReportStatus.PENDING);

        if (reportDto.reportedPost() != null) {
            Post reportedPost = postRepository.getReferenceById(reportDto.reportedPost());
            if (reportedPost.getUser().getId().equals(reporterUser.getId())) {
                throw new DataIntegrityViolationException("You cannot report your post.");
            }

            if (reportRepository.existsByReporterAndReportedPost(reporterUser, reportedPost)) {
                throw new DataIntegrityViolationException("You have already reported this post.");
            }

            report.setReportedPost(reportedPost);
        }

        if (reportDto.reportedUsername() != null) {
            User reportedUser = userRepository.findByUsername(reportDto.reportedUsername())
                    .orElseThrow(() -> new EntityNotFoundException("User not found"));
            if (reportedUser.getId().equals(reporterUser.getId())) {
                throw new DataIntegrityViolationException("You cannot report yourself.");
            }

            if (reportRepository.existsByReporterAndReportedUser(reporterUser, reportedUser)) {
                throw new DataIntegrityViolationException("You have already reported this user.");
            }

            report.setReportedUser(reportedUser);
        }

        reportRepository.save(report);
    }

    public void resolveReport(UUID reportId) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new EntityNotFoundException("Report not found"));
        ;
        report.setStatus(ReportStatus.RESOLVED);
        reportRepository.save(report);
    }

    public void dismissReport(UUID reportId) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new EntityNotFoundException("Report not found"));
        ;
        report.setStatus(ReportStatus.DISMISSED);
        reportRepository.save(report);
    }

    public List<ReportResponse> getReports(ReportStatus status, LocalDateTime lastCreatedAt) {
        lastCreatedAt = (lastCreatedAt == null) ? LocalDateTime.now() : lastCreatedAt;
        List<Report> reports = (status == null)
                ? reportRepository.findTop10ByCreatedAtLessThanOrderByCreatedAtDesc(lastCreatedAt)
                : reportRepository.findTop10ByStatusAndCreatedAtLessThanOrderByCreatedAtDesc(status, lastCreatedAt);
        List<ReportResponse> reportsResponses = new ArrayList<>();
        for (Report report : reports) {
            ReportResponse reportResponse = new ReportResponse(report.getId(),
                    report.getReportedPost() == null ? null : report.getReportedPost().getId(),
                    report.getReportedPost() == null ? null : report.getReportedPost().getTitle(),
                    report.getReportedUser() == null ? null : report.getReportedUser().getUsername(),
                    report.getReporter().getUsername(), report.getReason(),
                    report.getDetails(), report.getStatus(), report.getCreatedAt().toString());
            reportsResponses.add(reportResponse);
        }
        return reportsResponses;
    }

    public long getPendingReportsCount() {
        return reportRepository.countByStatus(ReportStatus.PENDING);
    }
}
