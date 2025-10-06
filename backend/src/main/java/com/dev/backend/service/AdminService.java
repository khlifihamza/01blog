package com.dev.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.dev.backend.dto.InsightsResponse;

@Service
public class AdminService {
    @Autowired
    private ReportService reportService;

    @Autowired
    private UserService userService;

    @Autowired
    private PostService postService;

    @Autowired
    private CommentService commentService;

    @Autowired
    private LikeService likeService;

    public InsightsResponse getInsights() {
        return new InsightsResponse(userService.getAllUsersCount(),
                postService.getAllPostsCount(), reportService.getPendingReportsCount(),
                likeService.getAllLikesCount() + commentService.getCommentsCount());
    }
}
