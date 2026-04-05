package com.mannn.todolist.service;

import com.mannn.todolist.domain.TaskGroup;
import com.mannn.todolist.domain.TaskGroupMember;
import com.mannn.todolist.repository.TaskGroupMemberRepository;
import com.mannn.todolist.repository.TaskGroupRepository;
import com.mannn.todolist.repository.TaskRepository;
import com.mannn.todolist.service.dto.TaskGroupDTO;
import java.time.Instant;
import java.util.ArrayList;
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
public class TaskGroupService {

    private static final Logger LOG = LoggerFactory.getLogger(TaskGroupService.class);

    private final TaskGroupRepository taskGroupRepository;
    private final TaskGroupMemberRepository taskGroupMemberRepository;
    private final TaskRepository taskRepository;

    public TaskGroupService(
        TaskGroupRepository taskGroupRepository,
        TaskGroupMemberRepository taskGroupMemberRepository,
        TaskRepository taskRepository
    ) {
        this.taskGroupRepository = taskGroupRepository;
        this.taskGroupMemberRepository = taskGroupMemberRepository;
        this.taskRepository = taskRepository;
    }

    public Mono<TaskGroupDTO> createGroup(TaskGroupDTO dto) {
        return getCurrentUserLogin()
            .flatMap(login -> {
                TaskGroup group = new TaskGroup();
                group.setName(dto.getName());
                group.setDescription(dto.getDescription());
                group.setColor(dto.getColor() != null ? dto.getColor() : "#6C5CE7");
                group.setOwnerId(login);
                group.setCreatedDate(Instant.now());
                return taskGroupRepository
                    .save(group)
                    .flatMap(savedGroup -> {
                        // Add owner as a member with OWNER role
                        TaskGroupMember ownerMember = new TaskGroupMember();
                        ownerMember.setGroupId(savedGroup.getId());
                        ownerMember.setUserId(login);
                        ownerMember.setRole("OWNER");
                        return taskGroupMemberRepository.save(ownerMember).then(Mono.just(savedGroup));
                    });
            })
            .flatMap(this::toDTO);
    }

    public Mono<TaskGroupDTO> updateGroup(Long id, TaskGroupDTO dto) {
        return getCurrentUserLogin()
            .flatMap(login ->
                taskGroupRepository
                    .findById(id)
                    .filter(group -> group.getOwnerId().equals(login))
                    .switchIfEmpty(Mono.error(new RuntimeException("Not authorized")))
                    .flatMap(group -> {
                        group.setName(dto.getName());
                        group.setDescription(dto.getDescription());
                        if (dto.getColor() != null) group.setColor(dto.getColor());
                        return taskGroupRepository.save(group);
                    })
            )
            .flatMap(this::toDTO);
    }

    public Mono<Void> deleteGroup(Long id) {
        return getCurrentUserLogin().flatMap(login ->
            taskGroupRepository
                .findById(id)
                .filter(group -> group.getOwnerId().equals(login))
                .switchIfEmpty(Mono.error(new RuntimeException("Not authorized")))
                .flatMap(group ->
                    taskGroupMemberRepository
                        .findByGroupId(id)
                        .flatMap(member -> taskGroupMemberRepository.deleteById(member.getId()))
                        .then(taskGroupRepository.deleteById(id))
                )
        );
    }

    @Transactional(readOnly = true)
    public Flux<TaskGroupDTO> getMyGroups() {
        return getCurrentUserLogin()
            .flatMapMany(login -> taskGroupRepository.findAllAccessibleByUser(login))
            .flatMap(this::toDTO);
    }

    @Transactional(readOnly = true)
    public Mono<TaskGroupDTO> getGroupById(Long id) {
        return getCurrentUserLogin().flatMap(login ->
            taskGroupRepository
                .findById(id)
                .flatMap(group ->
                    taskGroupMemberRepository
                        .findByGroupIdAndUserId(id, login)
                        .switchIfEmpty(
                            group.getOwnerId().equals(login)
                                ? Mono.just(new TaskGroupMember())
                                : Mono.error(new RuntimeException("Not authorized"))
                        )
                        .then(toDTO(group))
                )
        );
    }

    public Mono<Void> addMember(Long groupId, String memberLogin) {
        return getCurrentUserLogin().flatMap(login ->
            taskGroupRepository
                .findById(groupId)
                .filter(group -> group.getOwnerId().equals(login))
                .switchIfEmpty(Mono.error(new RuntimeException("Not authorized")))
                .flatMap(group ->
                    taskGroupMemberRepository
                        .findByGroupIdAndUserId(groupId, memberLogin)
                        .flatMap(existing -> Mono.<Void>error(new RuntimeException("User already a member")))
                        .switchIfEmpty(
                            Mono.defer(() -> {
                                TaskGroupMember member = new TaskGroupMember();
                                member.setGroupId(groupId);
                                member.setUserId(memberLogin);
                                member.setRole("MEMBER");
                                return taskGroupMemberRepository.save(member).then();
                            })
                        )
                )
        );
    }

    public Mono<Void> removeMember(Long groupId, String memberLogin) {
        return getCurrentUserLogin().flatMap(login ->
            taskGroupRepository
                .findById(groupId)
                .filter(group -> group.getOwnerId().equals(login))
                .switchIfEmpty(Mono.error(new RuntimeException("Not authorized")))
                .flatMap(group -> taskGroupMemberRepository.deleteByGroupIdAndUserId(groupId, memberLogin))
        );
    }

    @Transactional(readOnly = true)
    public Flux<String> getGroupMembers(Long groupId) {
        return taskGroupMemberRepository.findByGroupId(groupId).map(TaskGroupMember::getUserId);
    }

    private Mono<TaskGroupDTO> toDTO(TaskGroup group) {
        TaskGroupDTO dto = new TaskGroupDTO();
        dto.setId(group.getId());
        dto.setName(group.getName());
        dto.setDescription(group.getDescription());
        dto.setColor(group.getColor());
        dto.setOwnerId(group.getOwnerId());
        dto.setCreatedDate(group.getCreatedDate());

        return taskGroupMemberRepository
            .findByGroupId(group.getId())
            .map(TaskGroupMember::getUserId)
            .collectList()
            .map(members -> {
                dto.setMembers(members);
                return dto;
            })
            .flatMap(d ->
                taskRepository
                    .findByGroupIdOrderByDueDateAsc(group.getId())
                    .count()
                    .map(count -> {
                        d.setTaskCount(count);
                        return d;
                    })
            );
    }

    private Mono<String> getCurrentUserLogin() {
        return ReactiveSecurityContextHolder.getContext()
            .map(SecurityContext::getAuthentication)
            .map(auth -> auth.getName());
    }
}
