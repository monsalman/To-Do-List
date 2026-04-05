package com.mannn.todolist.service.dto;

import java.time.Instant;
import java.time.LocalDate;

public class TaskDTO {

    private Long id;
    private String title;
    private String description;
    private LocalDate dueDate;
    private String priority;
    private String status;
    private Boolean isPrivate;
    private String userId;
    private Long groupId;
    private String groupName;
    private Instant createdDate;
    private Instant lastModifiedDate;

    public TaskDTO() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Boolean getIsPrivate() {
        return isPrivate;
    }

    public void setIsPrivate(Boolean isPrivate) {
        this.isPrivate = isPrivate;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public Long getGroupId() {
        return groupId;
    }

    public void setGroupId(Long groupId) {
        this.groupId = groupId;
    }

    public String getGroupName() {
        return groupName;
    }

    public void setGroupName(String groupName) {
        this.groupName = groupName;
    }

    public Instant getCreatedDate() {
        return createdDate;
    }

    public void setCreatedDate(Instant createdDate) {
        this.createdDate = createdDate;
    }

    public Instant getLastModifiedDate() {
        return lastModifiedDate;
    }

    public void setLastModifiedDate(Instant lastModifiedDate) {
        this.lastModifiedDate = lastModifiedDate;
    }

    @Override
    public String toString() {
        return (
            "TaskDTO{" +
            "id=" +
            id +
            ", title='" +
            title +
            '\'' +
            ", dueDate=" +
            dueDate +
            ", priority='" +
            priority +
            '\'' +
            ", status='" +
            status +
            '\'' +
            ", isPrivate=" +
            isPrivate +
            '}'
        );
    }
}
