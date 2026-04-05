package com.mannn.todolist.repository;

import com.mannn.todolist.domain.TaskGroupMember;
import org.springframework.data.r2dbc.repository.R2dbcRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Repository
public interface TaskGroupMemberRepository extends R2dbcRepository<TaskGroupMember, Long> {
    Flux<TaskGroupMember> findByGroupId(Long groupId);

    Flux<TaskGroupMember> findByUserId(String userId);

    Mono<TaskGroupMember> findByGroupIdAndUserId(Long groupId, String userId);

    Mono<Void> deleteByGroupIdAndUserId(Long groupId, String userId);
}
