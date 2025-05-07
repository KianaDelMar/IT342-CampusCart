package edu.cit.campuscart.service;

import edu.cit.campuscart.entity.NotificationEntity;
import edu.cit.campuscart.entity.UserEntity;
import edu.cit.campuscart.repository.NotificationRepository;
import edu.cit.campuscart.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    public NotificationEntity createNotification(String message, String type, String username) {
        UserEntity user = userRepository.findById(username)
                .orElseThrow(() -> new RuntimeException("User not found with username: " + username));
    
        NotificationEntity notification = new NotificationEntity();
        notification.setMessage(message);
        notification.setType(type);
        notification.setIsRead(false);
        notification.setTimestamp(LocalDateTime.now());
        notification.setUser(user);
    
        return notificationRepository.save(notification);
    }

    public List<NotificationEntity> getNotificationsForUser(String username) {
        UserEntity user = userRepository.findById(username)
                .orElseThrow(() -> new RuntimeException("User not found with username: " + username));
    
        return notificationRepository.findByUserOrderByTimestampDesc(user);
    }

    @Transactional
    public void markAllNotificationsAsRead(String username) {
        UserEntity user = userRepository.findById(username)
                .orElseThrow(() -> new RuntimeException("User not found with username: " + username));
        
        List<NotificationEntity> notifications = notificationRepository.findByUserOrderByTimestampDesc(user);
        for (NotificationEntity notification : notifications) {
            notification.setIsRead(true);
        }
        notificationRepository.saveAll(notifications);
    }
}