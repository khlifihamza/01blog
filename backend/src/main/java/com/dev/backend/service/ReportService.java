package com.dev.backend.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import com.dev.backend.dto.ReportRequest;
import com.dev.backend.model.Post;
import com.dev.backend.model.Report;
import com.dev.backend.model.ReportStatus;
import com.dev.backend.model.User;
import com.dev.backend.repository.PostRepository;
import com.dev.backend.repository.ReportRepository;
import com.dev.backend.repository.UserRepository;

@Service
public class ReportService {
    @Autowired
    private ReportRepository reportRepository;

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private UserRepository userRepository;

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
            report.setReported_post(reportedPost);
        }
        if (reportDto.reportedUsername() != null) {
            User reportedUser = userRepository.findByUsername(reportDto.reportedUsername()).orElseThrow();
            if (reportedUser.getId().equals(reporterUser.getId())) {
                throw new DataIntegrityViolationException("You cannot report yourself.");
            }
            report.setReported_user(reportedUser);
        }
        reportRepository.save(report);
    }

    public List<Report> getReports(){
        return reportRepository.findAll();
    }
}
