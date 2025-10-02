package com.dev.backend.controller;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.dev.backend.dto.Author;
import com.dev.backend.dto.DiscoveryPostResponse;
import com.dev.backend.dto.DiscoveryResponse;
import com.dev.backend.dto.DiscoveryUserResponse;
import com.dev.backend.model.Post;
import com.dev.backend.model.User;
import com.dev.backend.service.FollowService;
import com.dev.backend.service.PostService;
import com.dev.backend.service.UserService;

@RestController
@RequestMapping("/api/discovery")
public class DiscoveryController {
    @Autowired
    private PostService postService;

    @Autowired
    private UserService userService;

    @Autowired
    private FollowService followService;

    @GetMapping("suggest")
    public ResponseEntity<DiscoveryResponse> getDiscoveryData(@AuthenticationPrincipal User currentUser) {
        List<User> users = userService.getTop9Profiles();
        List<DiscoveryUserResponse> usersResponse = new ArrayList<>();
        for (User user : users) {
            DiscoveryUserResponse discoveryUserResponse = new DiscoveryUserResponse(user.getId(), user.getUsername(),
                    user.getAvatar() != null
                            ? "http://localhost:8080/api/post/file/" + user.getAvatar()
                            : null,
                    user.getBio(),
                    user.getFollowers().size(), user.getPosts().size(),
                    followService.isCurrentUserFollowUser(currentUser.getId(), user.getId()));
            usersResponse.add(discoveryUserResponse);
        }
        List<Post> posts = postService.getTop9Posts();
        List<DiscoveryPostResponse> postsResponse = new ArrayList<>();
        for (Post post : posts) {
            DiscoveryPostResponse discoveryPostResponse = new DiscoveryPostResponse(post.getId(), post.getTitle(),
                    post.getContent(),
                    new Author(post.getUser().getUsername(),
                            post.getUser().getAvatar() != null
                                    ? "http://localhost:8080/api/post/file/" + post.getUser().getAvatar()
                                    : null),
                    post.getCreatedAt().toString(), post.getLikes().size(), post.getComments().size(),
                    "http://localhost:8080/api/post/file/" + post.getThumbnail());
            postsResponse.add(discoveryPostResponse);
        }
        DiscoveryResponse discoveryResponse = new DiscoveryResponse(usersResponse, postsResponse);
        return ResponseEntity.ok(discoveryResponse);
    }

    @GetMapping("search")
    public ResponseEntity<DiscoveryResponse> searchData(@RequestParam String query,
            @AuthenticationPrincipal User currentUser) {
        List<User> users = userService.getSearchedUsers(query);
        List<DiscoveryUserResponse> usersResponse = new ArrayList<>();
        for (User user : users) {
            DiscoveryUserResponse discoveryUserResponse = new DiscoveryUserResponse(user.getId(), user.getUsername(),
                    user.getAvatar() != null
                            ? "http://localhost:8080/api/post/file/" + user.getAvatar()
                            : null,
                    user.getBio(),
                    user.getFollowers().size(), user.getPosts().size(),
                    followService.isCurrentUserFollowUser(currentUser.getId(), user.getId()));
            usersResponse.add(discoveryUserResponse);
        }
        List<Post> posts = postService.getSearchedPosts(query);
        List<DiscoveryPostResponse> postsResponse = new ArrayList<>();
        for (Post post : posts) {
            DiscoveryPostResponse discoveryPostResponse = new DiscoveryPostResponse(post.getId(), post.getTitle(),
                    post.getContent(),
                    new Author(post.getUser().getUsername(),
                            post.getUser().getAvatar() != null
                                    ? "http://localhost:8080/api/post/file/" + post.getUser().getAvatar()
                                    : null),
                    post.getCreatedAt().toString(), post.getLikes().size(), post.getComments().size(),
                    "http://localhost:8080/api/post/file/" + post.getThumbnail());
            postsResponse.add(discoveryPostResponse);
        }
        DiscoveryResponse discoveryResponse = new DiscoveryResponse(usersResponse, postsResponse);
        return ResponseEntity.ok(discoveryResponse);
    }
}
