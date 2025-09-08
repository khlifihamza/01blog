package com.dev.backend.controller;

import com.dev.backend.model.User;
import com.dev.backend.dto.LoginRequest;
import com.dev.backend.dto.RegisterRequest;
import com.dev.backend.dto.ApiResponse;
import com.dev.backend.service.AuthenticationService;
import com.dev.backend.service.JwtService;

import io.jsonwebtoken.JwtException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;

import org.apache.tomcat.util.http.SameSiteCookies;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.annotation.AuthenticationPrincipal;


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

        ResponseCookie cookie = ResponseCookie.from("token", jwtToken)
                    .httpOnly(true)
                    .secure(true)
                    .path("/")
                    .maxAge(jwtService.getExpirationTime() / 1000)
                    .sameSite(SameSiteCookies.STRICT.toString())
                    .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
        authenticatedUser.setPassword(null);
        return ResponseEntity.ok(authenticatedUser);
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

    @GetMapping("/check-auth")
    public ResponseEntity<?> checkAuth(@CookieValue(value = "token", required = false) String token,@AuthenticationPrincipal User currentUser) {
        try {
            if (token == null || token.isEmpty()) {
                return ResponseEntity.status(401).body("No token provided");
            }
            if (currentUser == null) {
                return ResponseEntity.status(401).body("User not found");
            }
            currentUser.setPassword(null);
            return ResponseEntity.ok(currentUser);
        } catch (JwtException e) {
            return ResponseEntity.status(401).body("Invalid or expired token");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Server error: " + e.getMessage());
        }
    }
}
