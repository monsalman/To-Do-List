package com.mannn.todolist.web.rest;

import com.mannn.todolist.service.TaskService;
import com.mannn.todolist.service.dto.TaskDTO;
import java.net.URI;
import java.time.LocalDate;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api")
public class TaskResource {

    private static final Logger LOG = LoggerFactory.getLogger(TaskResource.class);

    private final TaskService taskService;

    public TaskResource(TaskService taskService) {
        this.taskService = taskService;
    }

    @PostMapping("/tasks")
    public Mono<ResponseEntity<TaskDTO>> createTask(@RequestBody TaskDTO taskDTO) {
        LOG.debug("REST request to save Task : {}", taskDTO);
        return taskService
            .createTask(taskDTO)
            .map(result -> ResponseEntity.created(URI.create("/api/tasks/" + result.getId())).body(result));
    }

    @PutMapping("/tasks/{id}")
    public Mono<ResponseEntity<TaskDTO>> updateTask(@PathVariable Long id, @RequestBody TaskDTO taskDTO) {
        LOG.debug("REST request to update Task : {}, {}", id, taskDTO);
        return taskService.updateTask(id, taskDTO).map(result -> ResponseEntity.ok().body(result));
    }

    @DeleteMapping("/tasks/{id}")
    public Mono<ResponseEntity<Void>> deleteTask(@PathVariable Long id) {
        LOG.debug("REST request to delete Task : {}", id);
        return taskService.deleteTask(id).then(Mono.just(ResponseEntity.noContent().build()));
    }

    @GetMapping("/tasks")
    public Flux<TaskDTO> getAllTasks() {
        LOG.debug("REST request to get all Tasks for current user");
        return taskService.getAllTasksForCurrentUser();
    }

    @GetMapping("/tasks/{id}")
    public Mono<ResponseEntity<TaskDTO>> getTask(@PathVariable Long id) {
        LOG.debug("REST request to get Task : {}", id);
        return taskService.getTaskById(id).map(result -> ResponseEntity.ok().body(result));
    }

    @GetMapping("/tasks/calendar")
    public Flux<TaskDTO> getTasksByDateRange(@RequestParam LocalDate from, @RequestParam LocalDate to) {
        LOG.debug("REST request to get Tasks from {} to {}", from, to);
        return taskService.getTasksByDateRange(from, to);
    }

    @GetMapping("/tasks/stats")
    public Mono<ResponseEntity<Map<String, Long>>> getTaskStats() {
        LOG.debug("REST request to get Task stats");
        return taskService.getTaskStats().map(stats -> ResponseEntity.ok().body(stats));
    }
}
