package edu.cit.campuscart.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.time.LocalDateTime;

@Entity
public class NotificationEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String message;

    private String type;

    private boolean isRead;

    private LocalDateTime timestamp;

    @ManyToOne
    @JoinColumn(name = "user_username", referencedColumnName = "username")
    @JsonIgnore
    private UserEntity user; 

    // Default constructor
    public NotificationEntity() {
    }

    // Constructor with all fields
    public NotificationEntity(String message, String type, boolean isRead, LocalDateTime timestamp, UserEntity user) {
        this.message = message;
        this.type = type;
        this.isRead = isRead;
        this.timestamp = timestamp;
        this.user = user;
    }

    // Getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public boolean isRead() {
        return isRead;
    }

    public void setIsRead(boolean read) {
        isRead = read;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public UserEntity getUser() {
        return user;
    }

    public void setUser(UserEntity user) {
        this.user = user;
    }

    @Override
    public String toString() {
        return "Notification{" +
                "id=" + id +
                ", message='" + message + '\'' +
                ", type='" + type + '\'' +
                ", isRead=" + isRead +
                ", timestamp=" + timestamp +
                ", user=" + user +
                '}';
    }
}