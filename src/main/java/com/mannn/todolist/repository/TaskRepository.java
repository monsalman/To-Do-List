package com.mannn.todolist.repository;

import com.mannn.todolist.domain.Task;
import java.time.LocalDate;
import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.r2dbc.repository.R2dbcRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;

@Repository
public interface TaskRepository extends R2dbcRepository<Task, Long> {
    Flux<Task> findByUserIdOrderByDueDateAsc(String userId);

    Flux<Task> findByUserIdAndDueDateBetweenOrderByDueDateAsc(String userId, LocalDate startDate, LocalDate endDate);

    Flux<Task> findByUserIdAndStatusOrderByDueDateAsc(String userId, String status);

    Flux<Task> findByGroupIdOrderByDueDateAsc(Long groupId);

    @Query(
        "SELECT t.* FROM jhi_task t " +
            "LEFT JOIN jhi_task_group_member m ON t.group_id = m.group_id " +
            "WHERE t.user_id = :userId " +
            "OR (t.group_id IS NOT NULL AND m.user_id = :userId) " +
            "ORDER BY t.due_date ASC NULLS LAST"
    )
    Flux<Task> findAllAccessibleByUser(String userId);

    @Query(
        "SELECT t.* FROM jhi_task t " +
            "LEFT JOIN jhi_task_group_member m ON t.group_id = m.group_id " +
            "WHERE (t.user_id = :userId OR (t.group_id IS NOT NULL AND m.user_id = :userId)) " +
            "AND t.due_date BETWEEN :startDate AND :endDate " +
            "ORDER BY t.due_date ASC"
    )
    Flux<Task> findAllAccessibleByUserAndDateRange(String userId, LocalDate startDate, LocalDate endDate);

    @Query(
        "SELECT COUNT(t.id) FROM jhi_task t " +
            "LEFT JOIN jhi_task_group_member m ON t.group_id = m.group_id " +
            "WHERE (t.user_id = :userId OR (t.group_id IS NOT NULL AND m.user_id = :userId)) " +
            "AND t.status = :status"
    )
    reactor.core.publisher.Mono<Long> countByUserAndStatus(String userId, String status);
}
