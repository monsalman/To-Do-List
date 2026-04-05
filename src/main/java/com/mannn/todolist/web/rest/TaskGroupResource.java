package com.mannn.todolist.web.rest;

import com.mannn.todolist.service.TaskGroupService;
import com.mannn.todolist.service.dto.TaskGroupDTO;
import java.net.URI;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api")
public class TaskGroupResource {

    private static final Logger LOG = LoggerFactory.getLogger(TaskGroupResource.class);

    private final TaskGroupService taskGroupService;

    public TaskGroupResource(TaskGroupService taskGroupService) {
        this.taskGroupService = taskGroupService;
    }

    @PostMapping("/task-groups")
    public Mono<ResponseEntity<TaskGroupDTO>> createGroup(@RequestBody TaskGroupDTO dto) {
        LOG.debug("REST request to save TaskGroup : {}", dto);
        return taskGroupService
            .createGroup(dto)
            .map(result -> ResponseEntity.created(URI.create("/api/task-groups/" + result.getId())).body(result));
    }

    @PutMapping("/task-groups/{id}")
    public Mono<ResponseEntity<TaskGroupDTO>> updateGroup(@PathVariable Long id, @RequestBody TaskGroupDTO dto) {
        LOG.debug("REST request to update TaskGroup : {}, {}", id, dto);
        return taskGroupService.updateGroup(id, dto).map(result -> ResponseEntity.ok().body(result));
    }

    @DeleteMapping("/task-groups/{id}")
    public Mono<ResponseEntity<Void>> deleteGroup(@PathVariable Long id) {
        LOG.debug("REST request to delete TaskGroup : {}", id);
        return taskGroupService.deleteGroup(id).then(Mono.just(ResponseEntity.noContent().build()));
    }

    @GetMapping("/task-groups")
    public Flux<TaskGroupDTO> getMyGroups() {
        LOG.debug("REST request to get all TaskGroups for current user");
        return taskGroupService.getMyGroups();
    }

    @GetMapping("/task-groups/{id}")
    public Mono<ResponseEntity<TaskGroupDTO>> getGroup(@PathVariable Long id) {
        LOG.debug("REST request to get TaskGroup : {}", id);
        return taskGroupService.getGroupById(id).map(result -> ResponseEntity.ok().body(result));
    }

    @PostMapping("/task-groups/{id}/members")
    public Mono<ResponseEntity<Void>> addMember(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String login = body.get("login");
        LOG.debug("REST request to add member {} to TaskGroup : {}", login, id);
        return taskGroupService.addMember(id, login).then(Mono.just(ResponseEntity.ok().build()));
    }

    @DeleteMapping("/task-groups/{id}/members/{login}")
    public Mono<ResponseEntity<Void>> removeMember(@PathVariable Long id, @PathVariable String login) {
        LOG.debug("REST request to remove member {} from TaskGroup : {}", login, id);
        return taskGroupService.removeMember(id, login).then(Mono.just(ResponseEntity.noContent().build()));
    }

    @GetMapping("/task-groups/{id}/members")
    public Flux<String> getGroupMembers(@PathVariable Long id) {
        LOG.debug("REST request to get members of TaskGroup : {}", id);
        return taskGroupService.getGroupMembers(id);
    }
}
