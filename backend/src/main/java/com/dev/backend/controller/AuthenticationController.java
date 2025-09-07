package com.dev.backend.controller;

import com.dev.backend.model.User;
import com.dev.backend.dto.LoginRequest;
import com.dev.backend.dto.RegisterRequest;
import com.dev.backend.dto.ApiResponse;
import com.dev.backend.service.AuthenticationService;
import com.dev.backend.service.JwtService;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RequestMapping("/api/auth")
@RestController
public class AuthenticationController {
    private final JwtService jwtService;

    private final AuthenticationService authenticationService;

    public AuthenticationController(JwtService jwtService, AuthenticationService authenticationService) {
        this.jwtService = jwtService;
        this.authenticationService = authenticationService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Validated @RequestBody RegisterRequest registerUserDto) {
        try {
            User registeredUser = authenticationService.signup(registerUserDto);
            ApiResponse response = new ApiResponse(registeredUser.getUsername() + " Registered successfully");
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (DataIntegrityViolationException e) {
            String error = e.getMessage();
            if (error.contains(registerUserDto.username())) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body("Error: Username already exists!");
            }
            if (error.contains(registerUserDto.email())) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body("Error: Email already exists!");
            }
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Error: User registration failed!");
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@CookieValue(value = "token", required = false) String token,
            @RequestBody LoginRequest loginUserDto, HttpServletResponse response) {

        User authenticatedUser = authenticationService.login(loginUserDto);

        String jwtToken = jwtService.generateToken(authenticatedUser);

        Cookie cookie = new Cookie("token", jwtToken);
        cookie.setMaxAge((int) jwtService.getExpirationTime() / 1000);
        cookie.setSecure(false);
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        response.addCookie(cookie);
        ApiResponse apiResponse = new ApiResponse("Logged successfully");
        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/logout")
    public ResponseEntity<?> logout(@CookieValue(value = "token", required = false) String token, HttpServletResponse response) {
        if (token == null) {
            return ResponseEntity.ok("You are not logged in.");
        }
        Cookie cookie = new Cookie("token", null);
        cookie.setMaxAge(0);
        cookie.setPath("/");
        response.addCookie(cookie);
        ApiResponse apiResponse = new ApiResponse("Logout successful!");
        return ResponseEntity.ok(apiResponse);
    }
}
