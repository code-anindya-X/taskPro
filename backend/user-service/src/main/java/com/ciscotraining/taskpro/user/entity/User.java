package com.ciscotraining.taskpro.user.entity;

import lombok.*;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;

@Document(collection = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    private ObjectId id;

    @Indexed(unique = true)
    @NonNull
    private String userName;

    private String email;

    @NonNull
    private String password;

    @Builder.Default
    private List<String> roles = List.of("USER");

    private Instant createdAt;
    private Instant updatedAt;

    @Builder.Default
    private String status = "ACTIVE"; // ACTIVE, LOCKED, DELETED
}

