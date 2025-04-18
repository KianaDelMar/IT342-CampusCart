package edu.cit.campuscart.service;

import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.FirebaseMessagingException;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {

    public void sendPushNotification(String token) {
        Notification notification = Notification.builder()
            .setTitle("Product Approved")
            .setBody("Your product is approved by Admin!")
            .build();

        Message message = Message.builder()
            .setToken(token)
            .setNotification(notification)
            .build();

        try {
            FirebaseMessaging.getInstance().send(message);
        } catch (FirebaseMessagingException e) {
            e.printStackTrace();
        }
    }
}