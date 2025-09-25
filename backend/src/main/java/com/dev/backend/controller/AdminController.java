package com.dev.backend.controller;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dev.backend.dto.AdminPostResponse;
import com.dev.backend.dto.ApiResponse;
import com.dev.backend.dto.InsightsResponse;
import com.dev.backend.dto.ReportResponse;
import com.dev.backend.dto.UserResponse;
import com.dev.backend.model.Post;
import com.dev.backend.model.Report;
import com.dev.backend.model.User;
import com.dev.backend.service.CommentService;
import com.dev.backend.service.LikeService;
import com.dev.backend.service.PostService;
import com.dev.backend.service.ReportService;
import com.dev.backend.service.UserService;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
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

    @GetMapping("/get-insights")
    public ResponseEntity<InsightsResponse> getInsights() {
        InsightsResponse insightsResponse = new InsightsResponse(userService.getAllUsersCount(),
                postService.getAllPostsCount(), reportService.getPendingReportsCount(),
                likeService.getAllLikesCount() + commentService.getCommentsCount());
        return ResponseEntity.ok(insightsResponse);
    }

    @GetMapping("/get-reports")
    public ResponseEntity<List<ReportResponse>> getReports() {
        List<Report> reports = reportService.getReports();
        List<ReportResponse> reportsResponses = new ArrayList<>();
        for (Report report : reports) {
            ReportResponse reportResponse = new ReportResponse(report.getId(),
                    report.getReported_post() == null ? null : report.getReported_post().getId(),
                    report.getReported_post() == null ? null : report.getReported_post().getTitle(),
                    report.getReported_user() == null ? null : report.getReported_user().getUsername(),
                    report.getReporter().getUsername(), report.getReason(),
                    report.getDetails(), report.getStatus(), report.getCreatedAt().toString());
            reportsResponses.add(reportResponse);
        }
        return ResponseEntity.ok(reportsResponses);
    }

    @GetMapping("/get-users")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        List<User> users = userService.getAllUSers();
        List<UserResponse> usersResponse = new ArrayList<>();
        for (User user : users) {
            UserResponse userResponse = new UserResponse(user.getId(), user.getUsername(), user.getEmail(),
                    null,
                    user.getRole().name(), user.getCreatedAt().toString(), user.getPosts().size(),
                    user.getStatus().name());
            usersResponse.add(userResponse);
        }
        return ResponseEntity.ok(usersResponse);
    }

    @PatchMapping("/ban-user/{username}")
    public ResponseEntity<ApiResponse> banUser(@PathVariable String username) {
        userService.banUser(username);
        return ResponseEntity.ok(new ApiResponse("User banned successfully"));
    }

    @PatchMapping("/unban-user/{username}")
    public ResponseEntity<ApiResponse> unbanUser(@PathVariable String username) {
        userService.unbanUser(username);
        return ResponseEntity.ok(new ApiResponse("User unbanned successfully"));
    }

    @DeleteMapping("/delete-user/{username}")
    public ResponseEntity<ApiResponse> deleteUser(@PathVariable String username) {
        userService.deleteUser(username);
        return ResponseEntity.ok(new ApiResponse("User deleted successfully"));
    }

    @PatchMapping("/hide-post/{postId}")
    public ResponseEntity<ApiResponse> hidePost(@PathVariable UUID postId) {
        postService.hidePost(postId);
        return ResponseEntity.ok(new ApiResponse("The post was hidden successfully"));
    }

    @PatchMapping("/unhide-post/{postId}")
    public ResponseEntity<ApiResponse> unhidePost(@PathVariable UUID postId) {
        postService.unhidePost(postId);
        return ResponseEntity.ok(new ApiResponse("The post was unhidden successfully"));
    }

    @DeleteMapping("/delete-post/{postId}")
    public ResponseEntity<ApiResponse> deletePOst(@PathVariable UUID postId,
            @AuthenticationPrincipal User currentUser) {
        postService.deletePost(postId, currentUser.getId());
        return ResponseEntity.ok(new ApiResponse("User deleted successfully"));
    }

    @GetMapping("/get-posts")
    public ResponseEntity<List<AdminPostResponse>> getAllPosts() {
        List<Post> posts = postService.getAllPosts();
        List<AdminPostResponse> postsResponse = new ArrayList<>();
        for (Post post : posts) {
            AdminPostResponse postResponse = new AdminPostResponse(post.getId(), post.getTitle(),
                    post.getUser().getUsername(), post.getCreatedAt().toString(), post.getLikes().size(),
                    post.getComments().size(), post.getStatus().name());
            postsResponse.add(postResponse);
        }
        return ResponseEntity.ok(postsResponse);
    }

    @PatchMapping("/resolve-report/{reportId}")
    public ResponseEntity<ApiResponse> resolveReport(@PathVariable UUID reportId) {
        reportService.resolveReport(reportId);
        return ResponseEntity.ok(new ApiResponse("The report was resolved successfully"));
    }

    @PatchMapping("/dismiss-report/{reportId}")
    public ResponseEntity<ApiResponse> dismissReport(@PathVariable UUID reportId) {
        reportService.dismissReport(reportId);
        return ResponseEntity.ok(new ApiResponse("The report was dismissed successfully"));
    }
}
