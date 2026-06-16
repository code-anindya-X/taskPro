package com.ciscotraining.taskpro.user.controller;

import com.ciscotraining.taskpro.common.dto.AuthResponse;
import com.ciscotraining.taskpro.common.dto.LoginRequest;
import com.ciscotraining.taskpro.common.dto.SignupRequest;
import com.ciscotraining.taskpro.common.exception.DuplicateResourceException;
import com.ciscotraining.taskpro.common.exception.ResourceNotFoundException;
import com.ciscotraining.taskpro.user.entity.User;
import com.ciscotraining.taskpro.user.service.JwtService;
import com.ciscotraining.taskpro.user.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signup(@Valid @RequestBody SignupRequest signupRequest) {
        if (userService.findByUserName(signupRequest.getUserName()).isPresent()) {
            throw new DuplicateResourceException("Username already exists: " + signupRequest.getUserName());
        }

        User savedUser = userService.createUser(
                signupRequest.getUserName(),
                signupRequest.getEmail(),
                passwordEncoder.encode(signupRequest.getPassword())
        );

        String token = jwtService.generateToken(
                savedUser.getId().toHexString(),
                savedUser.getUserName(),
                savedUser.getRoles()
        );

        AuthResponse authResponse = AuthResponse.builder()
                .accessToken(token)
                .expiresIn(jwtService.getJwtExpiration() / 1000)
                .user(AuthResponse.UserSummary.builder()
                        .id(savedUser.getId().toHexString())
                        .username(savedUser.getUserName())
                        .roles(savedUser.getRoles())
                        .build())
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(authResponse);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getUserName().trim(),
                        loginRequest.getPassword()));

        User user = userService.findByUserName(loginRequest.getUserName().trim())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String token = jwtService.generateToken(
                user.getId().toHexString(),
                user.getUserName(),
                user.getRoles()
        );

        AuthResponse authResponse = AuthResponse.builder()
                .accessToken(token)
                .expiresIn(jwtService.getJwtExpiration() / 1000)
                .user(AuthResponse.UserSummary.builder()
                        .id(user.getId().toHexString())
                        .username(user.getUserName())
                        .roles(user.getRoles())
                        .build())
                .build();

        return ResponseEntity.ok(authResponse);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        // Placeholder for Redis-backed session invalidation in Phase 5
        return ResponseEntity.noContent().build();
    }
}

