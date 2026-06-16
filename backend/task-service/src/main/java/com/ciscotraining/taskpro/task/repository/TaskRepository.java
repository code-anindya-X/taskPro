package com.ciscotraining.taskpro.task.repository;

import com.ciscotraining.taskpro.task.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TaskRepository extends JpaRepository<Task, UUID> {

    List<Task> findByOwnerUserId(String ownerUserId);

    Optional<Task> findByIdAndOwnerUserId(UUID id, String ownerUserId);

    List<Task> findByOwnerUserIdAndStatus(String ownerUserId, String status);

    List<Task> findByOwnerUserIdAndPriority(String ownerUserId, String priority);

    List<Task> findByOwnerUserIdAndStatusAndPriority(String ownerUserId, String status, String priority);

    void deleteByIdAndOwnerUserId(UUID id, String ownerUserId);
}

