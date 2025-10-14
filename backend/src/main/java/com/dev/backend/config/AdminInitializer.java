package com.dev.backend.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.dev.backend.model.Role;
import com.dev.backend.model.User;
import com.dev.backend.model.UserStatus;
import com.dev.backend.repository.UserRepository;

import org.springframework.security.crypto.password.PasswordEncoder;

@Component
public class AdminInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public AdminInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        userRepository.findByUsername("admin")
                .orElseGet(() -> {
                    User admin = new User();
                    admin.setUsername("admin");
                    admin.setEmail("admin@01blog.com");
                    admin.setPassword(passwordEncoder.encode("01Blog123@"));
                    admin.setRole(Role.ADMIN);
                    admin.setStatus(UserStatus.ACTIVE);
                    return userRepository.save(admin);
                });
    }
}
