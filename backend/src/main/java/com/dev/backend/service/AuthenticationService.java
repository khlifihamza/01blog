package com.dev.backend.service;

import com.dev.backend.repository.UserRepository;
import com.dev.backend.model.User;
import com.dev.backend.dto.LoginRequest;
import com.dev.backend.dto.RegisterRequest;
import com.dev.backend.model.Role;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthenticationService {
    private final UserRepository userRepository;
    
    private final PasswordEncoder passwordEncoder;
    
    private final AuthenticationManager authenticationManager;

    public AuthenticationService(
        UserRepository userRepository,
        AuthenticationManager authenticationManager,
        PasswordEncoder passwordEncoder
    ) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User signup(RegisterRequest input) {
        User user = new User(input.username(), input.email(), passwordEncoder.encode(input.password()), Role.USER);
        return userRepository.save(user);
    }

    public User login(LoginRequest input) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        input.identifier(),
                        input.password()
                )
        );
        
        return (input.identifier().contains("@")) ? userRepository.findByEmail(input.identifier())
                .orElseThrow() : userRepository.findByUsername(input.identifier())
                .orElseThrow();
    }
}
