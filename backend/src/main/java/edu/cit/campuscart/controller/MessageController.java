package edu.cit.campuscart.controller;

import edu.cit.campuscart.dto.MessageDTO;
import edu.cit.campuscart.dto.ConversationDTO;
import edu.cit.campuscart.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    @Autowired
    private MessageService messageService;

    @PostMapping
    public ResponseEntity<MessageDTO> sendMessage(@RequestBody MessageDTO messageDTO) {
        return ResponseEntity.ok(messageService.sendMessage(messageDTO));
    }

    @GetMapping("/conversation/{username1}/{username2}")
    public ResponseEntity<List<MessageDTO>> getConversation(
            @PathVariable String username1,
            @PathVariable String username2) {
        return ResponseEntity.ok(messageService.getConversation(username1, username2));
    }

    @PutMapping("/{messageId}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long messageId) {
        messageService.markAsRead(messageId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/unread/{username}")
    public ResponseEntity<List<MessageDTO>> getUnreadMessages(@PathVariable String username) {
        return ResponseEntity.ok(messageService.getUnreadMessages(username));
    }

    @GetMapping("/unread/count/{username}")
    public ResponseEntity<Long> getUnreadMessageCount(@PathVariable String username) {
        return ResponseEntity.ok(messageService.getUnreadMessageCount(username));
    }

    @GetMapping("/conversation/{username1}/{username2}/product/{productCode}")
    public ResponseEntity<List<MessageDTO>> getProductConversation(
            @PathVariable String username1,
            @PathVariable String username2,
            @PathVariable Integer productCode) {
        return ResponseEntity.ok(messageService.getProductConversation(username1, username2, productCode));
    }

    @GetMapping("/conversations/{username}")
    public ResponseEntity<List<ConversationDTO>> getConversations(@PathVariable String username) {
        System.out.println("getConversations called for: " + username);
        return ResponseEntity.ok(messageService.getConversations(username));
    }
} 