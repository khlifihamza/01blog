package com.dev.backend.repository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import com.dev.backend.model.Role;
import com.dev.backend.model.User;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@ActiveProfiles("test")
public class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User("testuser", "test@example.com", "password", Role.USER);
        userRepository.save(testUser);
    }

    @Test
    void whenFindByUsername_thenReturnUser() {
        // Act
        Optional<User> foundUser = userRepository.findByUsername("testuser");

        // Assert
        assertTrue(foundUser.isPresent(), "User should be found");
        assertEquals("testuser", foundUser.get().getUsername());
        assertEquals("test@example.com", foundUser.get().getEmail());
    }

    @Test
    void whenFindByUsernameWithNonExistentUsername_thenReturnEmpty() {
        // Act
        Optional<User> foundUser = userRepository.findByUsername("nonexistent");

        // Assert
        assertFalse(foundUser.isPresent(), "User should not be found");
    }

    @Test
    void whenFindByEmail_thenReturnUser() {
        // Act
        Optional<User> foundUser = userRepository.findByEmail("test@example.com");

        // Assert
        assertTrue(foundUser.isPresent(), "User should be found");
        assertEquals("test@example.com", foundUser.get().getEmail());
        assertEquals("testuser", foundUser.get().getUsername());
    }

    @Test
    void whenFindByEmailWithNonExistentEmail_thenReturnEmpty() {
        // Act
        Optional<User> foundUser = userRepository.findByEmail("nonexistent@example.com");

        // Assert
        assertFalse(foundUser.isPresent(), "User should not be found");
    }

    @Test
    void whenExistsByUsername_thenReturnTrue() {
        // Act
        boolean exists = userRepository.existsByUsername("testuser");

        // Assert
        assertTrue(exists, "Username should exist");
    }

    @Test
    void whenExistsByUsernameWithNonExistentUsername_thenReturnFalse() {
        // Act
        boolean exists = userRepository.existsByUsername("nonexistent");

        // Assert
        assertFalse(exists, "Username should not exist");
    }

    @Test
    void whenExistsByEmail_thenReturnTrue() {
        // Act
        boolean exists = userRepository.existsByEmail("test@example.com");

        // Assert
        assertTrue(exists, "Email should exist");
    }

    @Test
    void whenExistsByEmailWithNonExistentEmail_thenReturnFalse() {
        // Act
        boolean exists = userRepository.existsByEmail("nonexistent@example.com");

        // Assert
        assertFalse(exists, "Email should not exist");
    }
}