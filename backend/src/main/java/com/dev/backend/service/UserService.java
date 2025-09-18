package com.dev.backend.service;

import com.dev.backend.repository.UserRepository;
import com.dev.backend.model.User;
import com.dev.backend.dto.LoginRequest;
import com.dev.backend.dto.RegisterRequest;
import com.dev.backend.model.Role;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;

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
        User user = new User(input.username(), input.email(), passwordEncoder.encode(input.password()), Role.USER);
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

    public User getUserByUsername(String username){
        if (!userRepository.existsByUsername(username)) {
            throw new IllegalArgumentException("Username don't exists.");
        }
        return userRepository.findByUsername(username).orElseThrow();
    }
}
