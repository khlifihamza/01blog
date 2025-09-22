package com.dev.backend.controller;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dev.backend.dto.ApiResponse;
import com.dev.backend.dto.ReportResponse;
import com.dev.backend.dto.UserResponse;
import com.dev.backend.model.Report;
import com.dev.backend.model.User;
import com.dev.backend.service.ReportService;
import com.dev.backend.service.UserService;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
    @Autowired
    private ReportService reportService;

    @Autowired
    private UserService userService;

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
        return ResponseEntity.ok(new ApiResponse("User banned successefully"));
    }

    @PatchMapping("/unban-user/{username}")
    public ResponseEntity<ApiResponse> unbanUser(@PathVariable String username) {
        userService.unbanUser(username);
        return ResponseEntity.ok(new ApiResponse("User unbanned successefully"));
    }

    @DeleteMapping("/delete-user/{username}")
    public ResponseEntity<ApiResponse> deleteUser(@PathVariable String username) {
        userService.deleteUser(username);
        return ResponseEntity.ok(new ApiResponse("User deleted successefully"));
    }
}
