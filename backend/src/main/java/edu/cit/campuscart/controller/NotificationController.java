package edu.cit.campuscart.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import edu.cit.campuscart.entity.NotificationEntity;
import edu.cit.campuscart.service.NotificationService;

@RestController
@RequestMapping("api/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @GetMapping("/user/{username}")
    public List<NotificationEntity> getNotificationsForUser(@PathVariable String username) {
        return notificationService.getNotificationsForUser(username);
    }
}
