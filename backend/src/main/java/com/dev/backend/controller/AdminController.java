package com.dev.backend.controller;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.dev.backend.dto.AdminPostResponse;
import com.dev.backend.dto.ApiResponse;
import com.dev.backend.dto.InsightsResponse;
import com.dev.backend.dto.ReportResponse;
import com.dev.backend.dto.UserResponse;
import com.dev.backend.model.User;
import com.dev.backend.service.AdminService;
import com.dev.backend.service.PostService;
import com.dev.backend.service.ReportService;
import com.dev.backend.service.UserService;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;

    private final ReportService reportService;

    private final UserService userService;

    private final PostService postService;

    public AdminController(AdminService adminService, ReportService reportService, UserService userService,
            PostService postService) {
        this.adminService = adminService;
        this.reportService = reportService;
        this.postService = postService;
        this.userService = userService;
    }

    @GetMapping("/get-insights")
    public ResponseEntity<InsightsResponse> getInsights() {
        InsightsResponse insightsResponse = adminService.getInsights();
        return ResponseEntity.ok(insightsResponse);
    }

    @GetMapping("/get-reports")
    public ResponseEntity<List<ReportResponse>> getReports(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        List<ReportResponse> reports = reportService.getReports(PageRequest.of(page, size));
        return ResponseEntity.ok(reports);
    }

    @GetMapping("/get-users")
    public ResponseEntity<List<UserResponse>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        List<UserResponse> users = userService.getAllUsers(PageRequest.of(page, size));
        return ResponseEntity.ok(users);
    }

    @GetMapping("/search-users")
    public ResponseEntity<List<UserResponse>> getSearchedUsers(@RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        List<UserResponse> users = userService.getSearchedUsers(query, PageRequest.of(page, size));
        return ResponseEntity.ok(users);
    }

    @GetMapping("/search-posts")
    public ResponseEntity<List<AdminPostResponse>> getSearchedPosts(@RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        List<AdminPostResponse> posts = postService.getSearchedPosts(query, PageRequest.of(page, size));
        return ResponseEntity.ok(posts);
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
            @AuthenticationPrincipal User currentUser) throws IOException {
        postService.deletePost(postId, currentUser.getId());
        return ResponseEntity.ok(new ApiResponse("User deleted successfully"));
    }

    @GetMapping("/get-posts")
    public ResponseEntity<List<AdminPostResponse>> getAllPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        List<AdminPostResponse> posts = postService.getAllPosts(PageRequest.of(page, size));
        return ResponseEntity.ok(posts);
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
