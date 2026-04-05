package com.mannn.todolist.domain;

import java.io.Serial;
import java.io.Serializable;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

@Table("jhi_task_group_member")
public class TaskGroupMember implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    private Long id;

    @Column("group_id")
    private Long groupId;

    @Column("user_id")
    private String userId;

    @Column("role")
    private String role = "MEMBER";

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getGroupId() {
        return groupId;
    }

    public void setGroupId(Long groupId) {
        this.groupId = groupId;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof TaskGroupMember)) return false;
        return id != null && id.equals(((TaskGroupMember) o).id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }

    @Override
    public String toString() {
        return "TaskGroupMember{" + "id=" + id + ", groupId=" + groupId + ", userId='" + userId + '\'' + ", role='" + role + '\'' + '}';
    }
}
