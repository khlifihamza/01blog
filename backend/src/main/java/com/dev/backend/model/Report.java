package com.dev.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.AssertTrue;

@Entity
@Table(name = "reports")
public class Report extends BaseEntity {
    @Column(nullable = false)
    private String reason;

    @Column(columnDefinition = "TEXT")
    private String details;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reporter", nullable = false)
    private User reporter;

    @Enumerated(EnumType.STRING)
    private ReportStatus status;

    @ManyToOne
    @JoinColumn(name = "reported_user")
    private User reported_user;

    @ManyToOne
    @JoinColumn(name = "reported_post")
    private Post reported_post;

    @AssertTrue(message = "Either user or post must be set, but not both")
    private boolean isValidReference() {
        return (reported_user != null && reported_post == null) || (reported_user == null && reported_post != null);
    }

    public Report() {
    }

    public String getReason() {
        return reason;
    }

    public String getDetails() {
        return details;
    }

    public User getReporter() {
        return reporter;
    }

    public Post getReported_post() {
        return reported_post;
    }

    public User getReported_user() {
        return reported_user;
    }

    public ReportStatus getStatus() {
        return status;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public void setDetails(String details) {
        this.details = details;
    }

    public void setStatus(ReportStatus status) {
        this.status = status;
    }

    public void setReporter(User reporter) {
        this.reporter = reporter;
    }

    public void setReported_post(Post reported_post) {
        this.reported_post = reported_post;
    }

    public void setReported_user(User reported_user) {
        this.reported_user = reported_user;
    }
}
