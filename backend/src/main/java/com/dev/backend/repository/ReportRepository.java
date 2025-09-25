package com.dev.backend.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dev.backend.model.Report;
import com.dev.backend.model.ReportStatus;

public interface ReportRepository extends JpaRepository<Report, UUID> {
    Long countByStatus(ReportStatus status);
}
