package com.dev.backend.service;

import com.dev.backend.repository.UserRepository;
import com.dev.backend.model.User;
import com.dev.backend.model.UserStatus;
import com.dev.backend.dto.LoginRequest;
import com.dev.backend.dto.ProfileEditResponse;
import com.dev.backend.dto.RegisterRequest;
import com.dev.backend.model.Role;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;

    @Value("${file.upload-dir}")
    private String uploadDir;

    public UserService(
            UserRepository userRepository,
            AuthenticationManager authenticationManager,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User signup(RegisterRequest input) {
        if (userRepository.existsByUsername(input.username())) {
            throw new IllegalArgumentException("Username already exists.");
        }
        if (userRepository.existsByEmail(input.email())) {
            throw new IllegalArgumentException("Email already exists.");
        }
        if (!input.password().equals(input.confirmPassword())) {
            throw new IllegalArgumentException("confirm password incorrect");
        }
        User user = new User(input.username(), input.email(), passwordEncoder.encode(input.password()), Role.USER,
                UserStatus.ACTIVE);
        return userRepository.save(user);
    }

    public User login(LoginRequest input) {
        if (input.identifier().contains("@")) {
            if (!userRepository.existsByEmail(input.identifier())) {
                throw new IllegalArgumentException("Email don't exists.");
            }
            return userRepository.findByEmail(input.identifier()).orElseThrow();
        }
        if (!userRepository.existsByUsername(input.identifier())) {
            throw new IllegalArgumentException("Username don't exists.");
        }

        return userRepository.findByUsername(input.identifier()).orElseThrow();
    }

    public User getUserByUsername(String username) {
        if (!userRepository.existsByUsername(username)) {
            throw new IllegalArgumentException("Username don't exists.");
        }
        return userRepository.findByUsername(username).orElseThrow();
    }

    public void saveData(String username, ProfileEditResponse data) throws IOException {
        User user = userRepository.findByUsername(username).orElseThrow();
        if (!user.getUsername().equals(data.username()) && userRepository.existsByUsername(data.username())) {
            if (data.avatar() != null) {
                Path filePath = Paths.get(uploadDir + "/avatars" + data.avatar());
                Files.delete(filePath);
            }
            throw new IllegalArgumentException("Username already exists.");
        }
        if (!user.getEmail().equals(data.email()) && userRepository.existsByEmail(data.email())) {
            if (data.avatar() != null) {
                Path filePath = Paths.get(uploadDir + "/avatars" + data.avatar());
                Files.delete(filePath);
            }
            throw new IllegalArgumentException("Email already exists.");
        }
        user.setUsername(data.username());
        user.setEmail(data.email());
        user.setAvatar(data.avatar());
        user.setBio(data.bio());
        userRepository.save(user);
    }

    public List<User> getAllUSers() {
        return userRepository.findAll();
    }

    public List<User> getSearchedUsers(String Query) {
        return userRepository.findByUsernameContainingIgnoreCase(Query);
    }

    public void banUser(String username) {
        if (!userRepository.existsByUsername(username)) {
            throw new IllegalArgumentException("Username don't exists.");
        }
        User user = userRepository.findByUsername(username).orElseThrow();
        user.setStatus(UserStatus.BANNED);
        userRepository.save(user);
    }

    public void unbanUser(String username) {
        if (!userRepository.existsByUsername(username)) {
            throw new IllegalArgumentException("Username don't exists.");
        }
        User user = userRepository.findByUsername(username).orElseThrow();
        user.setStatus(UserStatus.ACTIVE);
        userRepository.save(user);
    }

    public void deleteUser(String username) {
        if (!userRepository.existsByUsername(username)) {
            throw new IllegalArgumentException("Username don't exists.");
        }
        User user = userRepository.findByUsername(username).orElseThrow();
        userRepository.delete(user);
    }

    public long getAllUsersCount() {
        return userRepository.count();
    }

    public List<User> getTop9Profiles() {
        return userRepository.findTop9ByOrderByFollowers();
    }
}
