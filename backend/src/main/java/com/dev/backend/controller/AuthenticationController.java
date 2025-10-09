package com.dev.backend.controller;

import com.dev.backend.model.User;
import com.dev.backend.dto.LoginRequest;
import com.dev.backend.dto.LoginResponse;
import com.dev.backend.dto.RegisterRequest;
import com.dev.backend.dto.ApiResponse;
import com.dev.backend.service.JwtService;
import com.dev.backend.service.UserService;

import jakarta.servlet.http.HttpServletResponse;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RequestMapping("/api/auth")
@RestController
public class AuthenticationController {
    private final JwtService jwtService;

    private final UserService authenticationService;

    public AuthenticationController(JwtService jwtService, UserService authenticationService) {
        this.jwtService = jwtService;
        this.authenticationService = authenticationService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Validated @RequestBody RegisterRequest registerUserDto) {
        User registeredUser = authenticationService.signup(registerUserDto);
        ApiResponse response = new ApiResponse(registeredUser.getUsername() + " Registered successfully");
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginUserDto, HttpServletResponse response) {
        User authenticatedUser = authenticationService.login(loginUserDto);
        String jwtToken = jwtService.generateToken(authenticatedUser);
        return ResponseEntity.ok(new LoginResponse(jwtToken, authenticatedUser.getRole().toString()));
    }
}