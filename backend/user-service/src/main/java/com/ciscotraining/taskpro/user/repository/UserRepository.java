package com.ciscotraining.taskpro.user.repository;

import com.ciscotraining.taskpro.user.entity.User;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface UserRepository extends MongoRepository<User, ObjectId> {
    Optional<User> findByUserName(String userName);

    void deleteByUserName(String userName);
}

