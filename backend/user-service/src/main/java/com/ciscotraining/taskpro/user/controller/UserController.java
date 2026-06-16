package com.ciscotraining.taskpro.user.controller;

import com.ciscotraining.taskpro.common.exception.ResourceNotFoundException;
import com.ciscotraining.taskpro.user.entity.User;
import com.ciscotraining.taskpro.user.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getCurrentUser() {
        String userName = getAuthenticatedUsername();
        User user = userService.findByUserName(userName)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Map<String, Object> response = Map.of(
                "id", user.getId().toHexString(),
                "username", user.getUserName(),
                "email", user.getEmail() != null ? user.getEmail() : "",
                "roles", user.getRoles(),
                "status", user.getStatus(),
                "createdAt", user.getCreatedAt() != null ? user.getCreatedAt().toString() : ""
        );

        return ResponseEntity.ok(response);
    }

    @PutMapping("/me")
    public ResponseEntity<Void> updateCurrentUser(@RequestBody Map<String, String> updates) {
        String userName = getAuthenticatedUsername();
        User user = userService.findByUserName(userName)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (updates.containsKey("email")) {
            user.setEmail(updates.get("email"));
        }
        if (updates.containsKey("userName")) {
            user.setUserName(updates.get("userName"));
        }
        userService.saveUser(user);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/me")
    public ResponseEntity<Void> deleteCurrentUser() {
        String userName = getAuthenticatedUsername();
        userService.deleteByUserName(userName);
        return ResponseEntity.noContent().build();
    }

    private String getAuthenticatedUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication.getName();
    }
}

