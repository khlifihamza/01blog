package com.dev.backend.models;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import com.dev.backend.model.Role;
import com.dev.backend.model.User;
import com.dev.backend.repository.UserRepository;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@ActiveProfiles("test")
public class UserEntityTests {

    @Autowired
    private UserRepository userRepository;

    @Test
    void whenUserIsPersisted_thenCreatedAtIsSetAutomatically() {
        // Arrange
        User user = new User("testuser", "test@example.com", "password", Role.USER);

        // Act
        User savedUser = userRepository.save(user);
        
        // Assert
        assertNotNull(savedUser.getId(), "ID should be generated");
        assertNotNull(savedUser.getCreatedAt(), "createdAt should be set");
        assertTrue(savedUser.getCreatedAt().isBefore(LocalDateTime.now().plusSeconds(1)));
        assertTrue(savedUser.getCreatedAt().isAfter(LocalDateTime.now().minusSeconds(1)));
        assertEquals("testuser", savedUser.getUsername());
        assertEquals("test@example.com", savedUser.getEmail());
        assertEquals("password", savedUser.getPassword());
        assertEquals(Role.USER, savedUser.getRole());
    }
}
