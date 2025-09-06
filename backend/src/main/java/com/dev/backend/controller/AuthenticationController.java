package com.dev.backend.controller;

import com.dev.backend.model.User;
import com.dev.backend.dto.RegisterRequest;
import com.dev.backend.dto.RegisterResponse;
import com.dev.backend.service.AuthenticationService;
import com.dev.backend.service.JwtService;

import org.springframework.dao.DataIntegrityViolationException;
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
    
    private final AuthenticationService authenticationService;

    public AuthenticationController(JwtService jwtService, AuthenticationService authenticationService) {
        this.jwtService = jwtService;
        this.authenticationService = authenticationService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Validated @RequestBody RegisterRequest registerUserDto) {
        try {
            User registeredUser = authenticationService.signup(registerUserDto);
            RegisterResponse response = new RegisterResponse(registeredUser.getUsername() + " Registered successfully");
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (DataIntegrityViolationException e) {
            String error = e.getMessage();
            if (error.contains(registerUserDto.username())){
                return ResponseEntity.badRequest().body("Error: Username already exists!");
            }
            if (error.contains(registerUserDto.email())){
                return ResponseEntity.badRequest().body("Error: Email already exists!");
            }
            return ResponseEntity.badRequest().body("Error: User registration failed!");
        }
        
    }
    
}
