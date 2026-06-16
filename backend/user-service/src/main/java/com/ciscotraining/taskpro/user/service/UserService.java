package com.ciscotraining.taskpro.user.service;

import com.ciscotraining.taskpro.user.entity.User;
import com.ciscotraining.taskpro.user.repository.UserRepository;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public User createUser(String userName, String email, String encodedPassword) {
        User user = User.builder()
                .userName(userName)
                .email(email)
                .password(encodedPassword)
                .roles(List.of("USER"))
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .status("ACTIVE")
                .build();
        return userRepository.save(user);
    }

    public Optional<User> findByUserName(String username) {
        return userRepository.findByUserName(username);
    }

    public Optional<User> findById(ObjectId id) {
        return userRepository.findById(id);
    }

    public User saveUser(User user) {
        user.setUpdatedAt(Instant.now());
        return userRepository.save(user);
    }

    public void deleteByUserName(String userName) {
        userRepository.deleteByUserName(userName);
    }
}

