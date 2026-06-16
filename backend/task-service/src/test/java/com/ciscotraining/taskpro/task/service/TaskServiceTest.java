package com.ciscotraining.taskpro.task.service;

import com.ciscotraining.taskpro.common.dto.TaskRequest;
import com.ciscotraining.taskpro.common.dto.TaskResponse;
import com.ciscotraining.taskpro.common.exception.ResourceNotFoundException;
import com.ciscotraining.taskpro.task.entity.Task;
import com.ciscotraining.taskpro.task.repository.TaskRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TaskServiceTest {

    @Mock
    private TaskRepository taskRepository;

    @InjectMocks
    private TaskService taskService;

    private static final String USER_A = "user-a-id";
    private static final String USER_B = "user-b-id";

    private Task taskA;
    private UUID taskAId;

    @BeforeEach
    void setUp() {
        taskAId = UUID.randomUUID();
        taskA = Task.builder()
                .id(taskAId)
                .ownerUserId(USER_A)
                .title("Test Task")
                .description("Description")
                .status("PENDING")
                .priority("HIGH")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    @Test
    void createTask_shouldSetOwnerUserId() {
        TaskRequest request = TaskRequest.builder()
                .title("New Task")
                .status("PENDING")
                .priority("MEDIUM")
                .build();

        when(taskRepository.save(any(Task.class))).thenAnswer(invocation -> {
            Task t = invocation.getArgument(0);
            t.setId(UUID.randomUUID());
            t.setCreatedAt(LocalDateTime.now());
            t.setUpdatedAt(LocalDateTime.now());
            return t;
        });

        TaskResponse response = taskService.createTask(request, USER_A);

        assertThat(response).isNotNull();
        assertThat(response.getTitle()).isEqualTo("New Task");
        verify(taskRepository).save(argThat(task -> USER_A.equals(task.getOwnerUserId())));
    }

    @Test
    void getTaskById_shouldReturnTaskForCorrectOwner() {
        when(taskRepository.findByIdAndOwnerUserId(taskAId, USER_A)).thenReturn(Optional.of(taskA));

        TaskResponse response = taskService.getTaskById(taskAId, USER_A);

        assertThat(response.getTitle()).isEqualTo("Test Task");
    }

    @Test
    void getTaskById_shouldThrowForWrongOwner() {
        when(taskRepository.findByIdAndOwnerUserId(taskAId, USER_B)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> taskService.getTaskById(taskAId, USER_B))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void updateTask_shouldRejectWrongOwner() {
        when(taskRepository.findByIdAndOwnerUserId(taskAId, USER_B)).thenReturn(Optional.empty());

        TaskRequest request = TaskRequest.builder()
                .title("Hacked")
                .status("PENDING")
                .priority("LOW")
                .build();

        assertThatThrownBy(() -> taskService.updateTask(taskAId, request, USER_B))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void deleteTask_shouldRejectWrongOwner() {
        when(taskRepository.findByIdAndOwnerUserId(taskAId, USER_B)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> taskService.deleteTask(taskAId, USER_B))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void getAllTasksForUser_shouldReturnOnlyUserTasks() {
        when(taskRepository.findByOwnerUserId(USER_A)).thenReturn(List.of(taskA));

        List<TaskResponse> tasks = taskService.getAllTasksForUser(USER_A);

        assertThat(tasks).hasSize(1);
        assertThat(tasks.get(0).getTitle()).isEqualTo("Test Task");
    }

    @Test
    void searchTasks_shouldFilterByStatusAndPriority() {
        when(taskRepository.findByOwnerUserIdAndStatusAndPriority(USER_A, "PENDING", "HIGH"))
                .thenReturn(List.of(taskA));

        List<TaskResponse> tasks = taskService.searchTasks(USER_A, "PENDING", "HIGH");

        assertThat(tasks).hasSize(1);
    }

    @Test
    void updateTask_shouldSetCompletedAtWhenCompleted() {
        when(taskRepository.findByIdAndOwnerUserId(taskAId, USER_A)).thenReturn(Optional.of(taskA));
        when(taskRepository.save(any(Task.class))).thenAnswer(i -> i.getArgument(0));

        TaskRequest request = TaskRequest.builder()
                .title("Test Task")
                .status("COMPLETED")
                .priority("HIGH")
                .build();

        TaskResponse response = taskService.updateTask(taskAId, request, USER_A);

        assertThat(response.getCompletedAt()).isNotNull();
    }

    @Test
    void updateTask_shouldClearCompletedAtWhenReopened() {
        taskA.setStatus("COMPLETED");
        taskA.setCompletedAt(LocalDateTime.now());
        when(taskRepository.findByIdAndOwnerUserId(taskAId, USER_A)).thenReturn(Optional.of(taskA));
        when(taskRepository.save(any(Task.class))).thenAnswer(i -> i.getArgument(0));

        TaskRequest request = TaskRequest.builder()
                .title("Test Task")
                .status("IN_PROGRESS")
                .priority("HIGH")
                .build();

        TaskResponse response = taskService.updateTask(taskAId, request, USER_A);

        assertThat(response.getCompletedAt()).isNull();
    }
}

