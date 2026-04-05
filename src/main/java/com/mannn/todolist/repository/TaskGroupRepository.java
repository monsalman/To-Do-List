package com.mannn.todolist.repository;

import com.mannn.todolist.domain.TaskGroup;
import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.r2dbc.repository.R2dbcRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;

@Repository
public interface TaskGroupRepository extends R2dbcRepository<TaskGroup, Long> {
    Flux<TaskGroup> findByOwnerIdOrderByCreatedDateDesc(String ownerId);

    @Query(
        "SELECT DISTINCT g.* FROM jhi_task_group g " +
            "LEFT JOIN jhi_task_group_member m ON g.id = m.group_id " +
            "WHERE g.owner_id = :userId OR m.user_id = :userId " +
            "ORDER BY g.created_date DESC"
    )
    Flux<TaskGroup> findAllAccessibleByUser(String userId);
}
