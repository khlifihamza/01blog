package com.dev.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.dev.backend.dto.InsightsResponse;

@Service
public class AdminService {
    private final ReportService reportService;

    private final UserService userService;

    private final PostService postService;

    private final CommentService commentService;

    private final LikeService likeService;

    @Autowired
    public AdminService(ReportService reportService, UserService userService, PostService postService,
            CommentService commentService, LikeService likeService) {
        this.commentService = commentService;
        this.likeService = likeService;
        this.postService = postService;
        this.reportService = reportService;
        this.userService = userService;
    }

    public InsightsResponse getInsights() {
        return new InsightsResponse(userService.getAllUsersCount(),
                postService.getAllPostsCount(), reportService.getPendingReportsCount(),
                likeService.getAllLikesCount() + commentService.getCommentsCount());
    }
}
