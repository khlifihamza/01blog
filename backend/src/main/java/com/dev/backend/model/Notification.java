package com.dev.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "notifications")
public class Notification extends BaseEntity {
    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User recipient;

    @Column(nullable = false)
    private String link;

    @Column(nullable = false)
    private boolean seen;

    public String getContent() {
        return content;
    }

    public User getRecipient() {
        return recipient;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getLink() {
        return link;
    }

    public void setLink(String link) {
        this.link = link;
    }

    public void setRecipient(User recipient) {
        this.recipient = recipient;
    }

    public void setSeen(boolean seen) {
        this.seen = seen;
    }

    public boolean getSeen() {
        return seen;
    }
}
