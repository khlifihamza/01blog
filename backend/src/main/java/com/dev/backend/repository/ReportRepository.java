package com.dev.backend.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.dev.backend.model.Post;
import com.dev.backend.model.Report;
import com.dev.backend.model.ReportStatus;
import com.dev.backend.model.User;

@Repository
public interface ReportRepository extends JpaRepository<Report, UUID> {
    Long countByStatus(ReportStatus status);

    List<Report> findTop10ByCreatedAtLessThanOrderByCreatedAtDesc(LocalDateTime lastCreatedAt);

    List<Report> findTop10ByStatusAndCreatedAtLessThanOrderByCreatedAtDesc(ReportStatus status,
            LocalDateTime lastCreatedAt);

    boolean existsByReporterAndReportedPost(User reporter, Post reportedPost);

    boolean existsByReporterAndReportedUser(User reporter, User reportedUser);
}