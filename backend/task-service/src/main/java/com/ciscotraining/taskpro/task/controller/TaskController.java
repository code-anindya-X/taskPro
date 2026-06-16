package com.ciscotraining.taskpro.task.controller;

import com.ciscotraining.taskpro.common.dto.TaskRequest;
import com.ciscotraining.taskpro.common.dto.TaskResponse;
import com.ciscotraining.taskpro.task.service.TaskService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    @Autowired
    private TaskService taskService;

    @GetMapping
    public ResponseEntity<List<TaskResponse>> getAllTasksForUser() {
        String ownerUserId = getAuthenticatedUserId();
        List<TaskResponse> tasks = taskService.getAllTasksForUser(ownerUserId);
        return ResponseEntity.ok(tasks);
    }

    @PostMapping
    public ResponseEntity<TaskResponse> createTask(@Valid @RequestBody TaskRequest request) {
        String ownerUserId = getAuthenticatedUserId();
        TaskResponse created = taskService.createTask(request, ownerUserId);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TaskResponse> getTaskById(@PathVariable String id) {
        String ownerUserId = getAuthenticatedUserId();
        UUID taskId = toUUID(id);
        TaskResponse task = taskService.getTaskById(taskId, ownerUserId);
        return ResponseEntity.ok(task);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TaskResponse> updateTask(@PathVariable String id, @Valid @RequestBody TaskRequest request) {
        String ownerUserId = getAuthenticatedUserId();
        UUID taskId = toUUID(id);
        TaskResponse updated = taskService.updateTask(taskId, request, ownerUserId);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable String id) {
        String ownerUserId = getAuthenticatedUserId();
        UUID taskId = toUUID(id);
        taskService.deleteTask(taskId, ownerUserId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    public ResponseEntity<List<TaskResponse>> searchTasks(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority) {
        String ownerUserId = getAuthenticatedUserId();
        List<TaskResponse> tasks = taskService.searchTasks(ownerUserId, status, priority);
        return ResponseEntity.ok(tasks);
    }

    /**
     * Extract userId directly from JWT claims (set by JwtAuthenticationFilter).
     * No user-service call needed.
     */
    private String getAuthenticatedUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return (String) authentication.getPrincipal();
    }

    private UUID toUUID(String id) {
        try {
            return UUID.fromString(id);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid task ID format: " + id);
        }
    }
}

