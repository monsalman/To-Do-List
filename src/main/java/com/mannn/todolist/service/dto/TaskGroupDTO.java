package com.mannn.todolist.service.dto;

import java.time.Instant;
import java.util.List;

public class TaskGroupDTO {

    private Long id;
    private String name;
    private String description;
    private String color;
    private String ownerId;
    private Instant createdDate;
    private List<String> members;
    private Long taskCount;

    public TaskGroupDTO() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public String getOwnerId() {
        return ownerId;
    }

    public void setOwnerId(String ownerId) {
        this.ownerId = ownerId;
    }

    public Instant getCreatedDate() {
        return createdDate;
    }

    public void setCreatedDate(Instant createdDate) {
        this.createdDate = createdDate;
    }

    public List<String> getMembers() {
        return members;
    }

    public void setMembers(List<String> members) {
        this.members = members;
    }

    public Long getTaskCount() {
        return taskCount;
    }

    public void setTaskCount(Long taskCount) {
        this.taskCount = taskCount;
    }

    @Override
    public String toString() {
        return "TaskGroupDTO{" + "id=" + id + ", name='" + name + '\'' + ", color='" + color + '\'' + ", ownerId='" + ownerId + '\'' + '}';
    }
}
