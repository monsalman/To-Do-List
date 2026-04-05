package com.mannn.todolist.service;

import com.mannn.todolist.domain.Task;
import com.mannn.todolist.repository.TaskGroupMemberRepository;
import com.mannn.todolist.repository.TaskGroupRepository;
import com.mannn.todolist.repository.TaskRepository;
import com.mannn.todolist.service.dto.TaskDTO;
import java.time.Instant;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.context.ReactiveSecurityContextHolder;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
@Transactional
public class TaskService {

    private static final Logger LOG = LoggerFactory.getLogger(TaskService.class);

    private final TaskRepository taskRepository;
    private final TaskGroupRepository taskGroupRepository;
    private final TaskGroupMemberRepository taskGroupMemberRepository;

    public TaskService(
        TaskRepository taskRepository,
        TaskGroupRepository taskGroupRepository,
        TaskGroupMemberRepository taskGroupMemberRepository
    ) {
        this.taskRepository = taskRepository;
        this.taskGroupRepository = taskGroupRepository;
        this.taskGroupMemberRepository = taskGroupMemberRepository;
    }

    public Mono<TaskDTO> createTask(TaskDTO taskDTO) {
        return getCurrentUserLogin()
            .flatMap(login -> {
                Task task = toEntity(taskDTO);
                task.setUserId(login);
                task.setCreatedDate(Instant.now());
                task.setLastModifiedDate(Instant.now());
                if (task.getStatus() == null) task.setStatus("PENDING");
                if (task.getPriority() == null) task.setPriority("MEDIUM");
                if (task.getIsPrivate() == null) task.setIsPrivate(true);
                return taskRepository.save(task);
            })
            .map(this::toDTO);
    }

    public Mono<TaskDTO> updateTask(Long id, TaskDTO taskDTO) {
        return getCurrentUserLogin()
            .flatMap(login ->
                taskRepository
                    .findById(id)
                    .flatMap(existingTask -> {
                        // Verify the user owns or has group access
                        if (!existingTask.getUserId().equals(login)) {
                            if (existingTask.getGroupId() == null) {
                                return Mono.error(new RuntimeException("Not authorized to update this task"));
                            }
                            return taskGroupMemberRepository
                                .findByGroupIdAndUserId(existingTask.getGroupId(), login)
                                .switchIfEmpty(Mono.error(new RuntimeException("Not authorized to update this task")))
                                .then(Mono.just(existingTask));
                        }
                        return Mono.just(existingTask);
                    })
                    .flatMap(existingTask -> {
                        existingTask.setTitle(taskDTO.getTitle());
                        existingTask.setDescription(taskDTO.getDescription());
                        existingTask.setDueDate(taskDTO.getDueDate());
                        existingTask.setPriority(taskDTO.getPriority());
                        existingTask.setStatus(taskDTO.getStatus());
                        existingTask.setIsPrivate(taskDTO.getIsPrivate());
                        existingTask.setGroupId(taskDTO.getGroupId());
                        existingTask.setLastModifiedDate(Instant.now());
                        return taskRepository.save(existingTask);
                    })
            )
            .map(this::toDTO);
    }

    public Mono<Void> deleteTask(Long id) {
        return getCurrentUserLogin().flatMap(login ->
            taskRepository
                .findById(id)
                .flatMap(task -> {
                    if (!task.getUserId().equals(login)) {
                        if (task.getGroupId() == null) {
                            return Mono.error(new RuntimeException("Not authorized to delete this task"));
                        }
                        return taskGroupMemberRepository
                            .findByGroupIdAndUserId(task.getGroupId(), login)
                            .switchIfEmpty(Mono.error(new RuntimeException("Not authorized to delete this task")))
                            .then(taskRepository.deleteById(id));
                    }
                    return taskRepository.deleteById(id);
                })
        );
    }

    @Transactional(readOnly = true)
    public Flux<TaskDTO> getAllTasksForCurrentUser() {
        return getCurrentUserLogin()
            .flatMapMany(login -> taskRepository.findAllAccessibleByUser(login))
            .flatMap(this::enrichWithGroupName);
    }

    @Transactional(readOnly = true)
    public Flux<TaskDTO> getTasksByDateRange(LocalDate from, LocalDate to) {
        return getCurrentUserLogin()
            .flatMapMany(login -> taskRepository.findAllAccessibleByUserAndDateRange(login, from, to))
            .flatMap(this::enrichWithGroupName);
    }

    @Transactional(readOnly = true)
    public Mono<TaskDTO> getTaskById(Long id) {
        return getCurrentUserLogin().flatMap(login ->
            taskRepository
                .findById(id)
                .flatMap(task -> {
                    if (task.getUserId().equals(login)) {
                        return enrichWithGroupName(task);
                    }
                    if (task.getGroupId() != null) {
                        return taskGroupMemberRepository
                            .findByGroupIdAndUserId(task.getGroupId(), login)
                            .switchIfEmpty(Mono.error(new RuntimeException("Not authorized")))
                            .then(enrichWithGroupName(task));
                    }
                    return Mono.error(new RuntimeException("Not authorized"));
                })
        );
    }

    @Transactional(readOnly = true)
    public Mono<Map<String, Long>> getTaskStats() {
        return getCurrentUserLogin().flatMap(login -> {
            Mono<Long> pending = taskRepository.countByUserAndStatus(login, "PENDING").defaultIfEmpty(0L);
            Mono<Long> inProgress = taskRepository.countByUserAndStatus(login, "IN_PROGRESS").defaultIfEmpty(0L);
            Mono<Long> done = taskRepository.countByUserAndStatus(login, "DONE").defaultIfEmpty(0L);

            return Mono.zip(pending, inProgress, done).map(tuple -> {
                Map<String, Long> stats = new HashMap<>();
                stats.put("pending", tuple.getT1());
                stats.put("inProgress", tuple.getT2());
                stats.put("done", tuple.getT3());
                stats.put("total", tuple.getT1() + tuple.getT2() + tuple.getT3());
                return stats;
            });
        });
    }

    private Mono<TaskDTO> enrichWithGroupName(Task task) {
        TaskDTO dto = toDTO(task);
        if (task.getGroupId() != null) {
            return taskGroupRepository
                .findById(task.getGroupId())
                .map(group -> {
                    dto.setGroupName(group.getName());
                    return dto;
                })
                .defaultIfEmpty(dto);
        }
        return Mono.just(dto);
    }

    private TaskDTO toDTO(Task task) {
        TaskDTO dto = new TaskDTO();
        dto.setId(task.getId());
        dto.setTitle(task.getTitle());
        dto.setDescription(task.getDescription());
        dto.setDueDate(task.getDueDate());
        dto.setPriority(task.getPriority());
        dto.setStatus(task.getStatus());
        dto.setIsPrivate(task.getIsPrivate());
        dto.setUserId(task.getUserId());
        dto.setGroupId(task.getGroupId());
        dto.setGroupName(task.getGroupName());
        dto.setCreatedDate(task.getCreatedDate());
        dto.setLastModifiedDate(task.getLastModifiedDate());
        return dto;
    }

    private Task toEntity(TaskDTO dto) {
        Task task = new Task();
        task.setId(dto.getId());
        task.setTitle(dto.getTitle());
        task.setDescription(dto.getDescription());
        task.setDueDate(dto.getDueDate());
        task.setPriority(dto.getPriority());
        task.setStatus(dto.getStatus());
        task.setIsPrivate(dto.getIsPrivate());
        task.setGroupId(dto.getGroupId());
        return task;
    }

    private Mono<String> getCurrentUserLogin() {
        return ReactiveSecurityContextHolder.getContext()
            .map(SecurityContext::getAuthentication)
            .map(auth -> auth.getName());
    }
}
