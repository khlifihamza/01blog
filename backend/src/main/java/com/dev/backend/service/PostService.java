package com.dev.backend.service;

import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.dev.backend.dto.PostRequest;
import com.dev.backend.model.Post;
import com.dev.backend.model.User;
import com.dev.backend.repository.PostRepository;

@Service
public class PostService {
    @Autowired
    private PostRepository postRepository;

    public Post savePost(PostRequest postDto, User user) {
        Post post = new Post();
        post.setTitle(postDto.title());
        post.setContent(postDto.content());
        post.setFiles(String.join(", ", postDto.files()));
        post.setUser(user);
        post.setThumbnail(postDto.thumbnail());
        post.setExcerpt(postDto.excerpt());
        return postRepository.save(post);
    }

    public Post updatePost(UUID id, PostRequest updatedPost) {
        Post post = postRepository.findById(id).orElseThrow();
        post.setTitle(updatedPost.title());
        post.setContent(updatedPost.content());
        post.setFiles(String.join(", ", updatedPost.files()));
        post.setThumbnail(updatedPost.thumbnail());
        post.setExcerpt(updatedPost.excerpt());
        return postRepository.save(post);
    }

    public void deletePost(UUID id) {
        postRepository.deleteById(id);
    }

    public List<Post> getPosts(UUID id) {
        return postRepository.findByUserIdOrderByCreatedAtDesc(id);
    }

    // public List<Post> getPosts(String username) {
    //     return postRepository.findByUsernameOrderByCreatedAtDesc(username);
    // }

    public Post getPost(UUID id) {
        return postRepository.findById(id).orElseThrow();
    }
}
