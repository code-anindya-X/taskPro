package com.ciscotraining.taskpro.user.service;

import com.ciscotraining.taskpro.user.entity.User;
import com.ciscotraining.taskpro.user.repository.UserRepository;
import org.bson.types.ObjectId;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserService userService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(new ObjectId())
                .userName("testuser")
                .email("test@example.com")
                .password("encodedPassword")
                .roles(List.of("USER"))
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .status("ACTIVE")
                .build();
    }

    @Test
    void createUser_shouldSaveAndReturnUser() {
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        User result = userService.createUser("testuser", "test@example.com", "encodedPassword");

        assertThat(result).isNotNull();
        assertThat(result.getUserName()).isEqualTo("testuser");
        verify(userRepository).save(any(User.class));
    }

    @Test
    void findByUserName_shouldReturnUserWhenExists() {
        when(userRepository.findByUserName("testuser")).thenReturn(Optional.of(testUser));

        Optional<User> result = userService.findByUserName("testuser");

        assertThat(result).isPresent();
        assertThat(result.get().getUserName()).isEqualTo("testuser");
    }

    @Test
    void findByUserName_shouldReturnEmptyWhenNotExists() {
        when(userRepository.findByUserName("unknown")).thenReturn(Optional.empty());

        Optional<User> result = userService.findByUserName("unknown");

        assertThat(result).isEmpty();
    }

    @Test
    void deleteByUserName_shouldCallRepository() {
        doNothing().when(userRepository).deleteByUserName("testuser");

        userService.deleteByUserName("testuser");

        verify(userRepository).deleteByUserName("testuser");
    }

    @Test
    void saveUser_shouldSetUpdatedAt() {
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        User result = userService.saveUser(testUser);

        assertThat(result).isNotNull();
        verify(userRepository).save(testUser);
    }
}

