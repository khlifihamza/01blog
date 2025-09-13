package com.dev.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "posts")
public class Post extends BaseEntity {

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(columnDefinition = "TEXT")
    private String mediaFiles;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    public Post() {}

    public Post(String title,String content, User user) {
        this.title = title;
        this.content = content;
        this.user = user;
    }

    public String getTitle() {
        return title;
    }

    public String getContent() {
        return content;
    }

    public String getMediaFiles() {
        return mediaFiles;
    }

    public User getUser() {
        return user;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public void setMediaFiles(String mediaFiles) {
        this.mediaFiles = mediaFiles;
    }

    public void setUser(User user) {
        this.user = user;
    }
}
