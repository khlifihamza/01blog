package com.dev.backend.repository;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.dev.backend.model.Post;
import com.dev.backend.model.Report;
import com.dev.backend.model.ReportStatus;
import com.dev.backend.model.User;

public interface ReportRepository extends JpaRepository<Report, UUID> {
    Long countByStatus(ReportStatus status);

    Page<Report> findAll(Pageable pageable);

    boolean existsByReporterAndReportedPost(User reporter, Post reportedPost);

    boolean existsByReporterAndReportedUser(User reporter, User reportedUser);
}