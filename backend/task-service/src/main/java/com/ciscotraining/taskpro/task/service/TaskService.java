package com.ciscotraining.taskpro.task.service;

import com.ciscotraining.taskpro.common.dto.TaskRequest;
import com.ciscotraining.taskpro.common.dto.TaskResponse;
import com.ciscotraining.taskpro.common.exception.ResourceNotFoundException;
import com.ciscotraining.taskpro.task.entity.Task;
import com.ciscotraining.taskpro.task.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class TaskService {

    @Autowired
    private TaskRepository taskRepository;

    public TaskResponse createTask(TaskRequest request, String ownerUserId) {
        Task task = Task.builder()
                .ownerUserId(ownerUserId)
                .title(request.getTitle())
                .description(request.getDescription())
                .status(request.getStatus())
                .priority(request.getPriority())
                .dueDate(request.getDueDate())
                .build();

        Task saved = taskRepository.save(task);
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<TaskResponse> getAllTasksForUser(String ownerUserId) {
        return taskRepository.findByOwnerUserId(ownerUserId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public TaskResponse getTaskById(UUID id, String ownerUserId) {
        Task task = taskRepository.findByIdAndOwnerUserId(id, ownerUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + id));
        return toResponse(task);
    }

    public TaskResponse updateTask(UUID id, TaskRequest request, String ownerUserId) {
        Task task = taskRepository.findByIdAndOwnerUserId(id, ownerUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + id));

        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setPriority(request.getPriority());
        task.setDueDate(request.getDueDate());

        // Handle status change and completedAt tracking
        if (!task.getStatus().equals(request.getStatus())) {
            task.setStatus(request.getStatus());
            if ("COMPLETED".equals(request.getStatus())) {
                task.setCompletedAt(LocalDateTime.now());
            } else {
                task.setCompletedAt(null);
            }
        }

        Task saved = taskRepository.save(task);
        return toResponse(saved);
    }

    public void deleteTask(UUID id, String ownerUserId) {
        Task task = taskRepository.findByIdAndOwnerUserId(id, ownerUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + id));
        taskRepository.delete(task);
    }

    @Transactional(readOnly = true)
    public List<TaskResponse> searchTasks(String ownerUserId, String status, String priority) {
        List<Task> tasks;
        if (status != null && priority != null) {
            tasks = taskRepository.findByOwnerUserIdAndStatusAndPriority(ownerUserId, status, priority);
        } else if (status != null) {
            tasks = taskRepository.findByOwnerUserIdAndStatus(ownerUserId, status);
        } else if (priority != null) {
            tasks = taskRepository.findByOwnerUserIdAndPriority(ownerUserId, priority);
        } else {
            tasks = taskRepository.findByOwnerUserId(ownerUserId);
        }
        return tasks.stream().map(this::toResponse).toList();
    }

    private TaskResponse toResponse(Task task) {
        return TaskResponse.builder()
                .id(task.getId().toString())
                .title(task.getTitle())
                .description(task.getDescription())
                .status(task.getStatus())
                .priority(task.getPriority())
                .dueDate(task.getDueDate())
                .createdAt(task.getCreatedAt())
                .updatedAt(task.getUpdatedAt())
                .completedAt(task.getCompletedAt())
                .build();
    }
}

