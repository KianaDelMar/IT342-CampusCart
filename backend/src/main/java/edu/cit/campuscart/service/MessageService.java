package edu.cit.campuscart.service;

import edu.cit.campuscart.dto.MessageDTO;
import edu.cit.campuscart.entity.MessageEntity;
import edu.cit.campuscart.entity.UserEntity;
import edu.cit.campuscart.entity.ProductEntity;
import edu.cit.campuscart.repository.MessageRepository;
import edu.cit.campuscart.repository.UserRepository;
import edu.cit.campuscart.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;
import java.util.Map;
import java.util.HashMap;
import java.util.Objects;
import java.time.LocalDateTime;
import java.util.ArrayList;
import edu.cit.campuscart.dto.ConversationDTO;

@Service
public class MessageService {

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Transactional
    public MessageDTO sendMessage(MessageDTO messageDTO) {
        UserEntity sender = userRepository.findById(messageDTO.getSenderId())
                .orElseThrow(() -> new RuntimeException("Sender not found"));
        UserEntity receiver = userRepository.findById(messageDTO.getReceiverId())
                .orElseThrow(() -> new RuntimeException("Receiver not found"));

        MessageEntity message = new MessageEntity();
        message.setSender(sender);
        message.setReceiver(receiver);
        message.setContent(messageDTO.getContent());
        message.setRead(false);

        // If product information is provided, set it
        if (messageDTO.getProductCode() != null) {
            ProductEntity product = productRepository.findById(messageDTO.getProductCode())
                    .orElseThrow(() -> new RuntimeException("Product not found"));
            message.setProduct(product);
        }

        MessageEntity savedMessage = messageRepository.save(message);
        return convertToDTO(savedMessage);
    }

    @Transactional(readOnly = true)
    public List<MessageDTO> getConversation(String username1, String username2) {
        List<MessageEntity> messages = messageRepository
            .findBySenderUsernameAndReceiverUsernameOrSenderUsernameAndReceiverUsernameOrderByCreatedAtAsc(
                username1, username2, username2, username1);
        return messages.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MessageDTO> getProductConversation(String username1, String username2, Integer productCode) {
        System.out.println("getProductConversation: " + username1 + ", " + username2 + ", " + productCode);
        List<MessageEntity> messages = messageRepository.findConversationByUsersAndProduct(username1, username2, productCode);
        System.out.println("Fetched " + messages.size() + " messages for product " + productCode);
        for (MessageEntity msg : messages) {
            System.out.println("Message: " + msg.getSender().getUsername() + " -> " + msg.getReceiver().getUsername() + " | Product: " + (msg.getProduct() != null ? msg.getProduct().getCode() : null) + " | Content: " + msg.getContent());
        }
        return messages.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public void markAsRead(Long messageId) {
        MessageEntity message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));
        message.setRead(true);
        messageRepository.save(message);
    }

    @Transactional(readOnly = true)
    public List<MessageDTO> getUnreadMessages(String username) {
        List<MessageEntity> messages = messageRepository.findByReceiverUsernameAndIsReadFalseOrderByCreatedAtDesc(username);
        return messages.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public long getUnreadMessageCount(String username) {
        return messageRepository.countByReceiverUsernameAndIsReadFalse(username);
    }

    @Transactional(readOnly = true)
    public List<ConversationDTO> getConversations(String username) {
        System.out.println("getConversations service for: " + username);
        List<MessageEntity> messages = messageRepository.findBySenderUsernameOrReceiverUsername(username, username);
        Map<String, MessageEntity> latestMessageMap = new HashMap<>();

        for (MessageEntity msg : messages) {
            String otherUsername = msg.getSender().getUsername().equals(username)
                ? msg.getReceiver().getUsername()
                : msg.getSender().getUsername();
            Integer productCode = msg.getProduct() != null ? msg.getProduct().getCode() : null;
            String key = otherUsername + ":" + (productCode != null ? productCode : "");

            if (!latestMessageMap.containsKey(key) ||
                msg.getCreatedAt().isAfter(latestMessageMap.get(key).getCreatedAt())) {
                latestMessageMap.put(key, msg);
            }
        }

        List<ConversationDTO> conversationList = new ArrayList<>();
        for (Map.Entry<String, MessageEntity> entry : latestMessageMap.entrySet()) {
            MessageEntity msg = entry.getValue();
            String otherUsername = msg.getSender().getUsername().equals(username)
                ? msg.getReceiver().getUsername()
                : msg.getSender().getUsername();
            Integer productCode = msg.getProduct() != null ? msg.getProduct().getCode() : null;

            ConversationDTO dto = new ConversationDTO();
            dto.setOtherUsername(otherUsername);
            dto.setProductCode(productCode);
            if (msg.getProduct() != null) {
                dto.setProductName(msg.getProduct().getName());
                dto.setProductImage(msg.getProduct().getImagePath());
            }
            dto.setLastMessage(msg.getContent());

            // Count unread messages for this conversation
            int unread = (int) messages.stream()
                .filter(m -> {
                    String o = m.getSender().getUsername().equals(username)
                        ? m.getReceiver().getUsername()
                        : m.getSender().getUsername();
                    Integer p = m.getProduct() != null ? m.getProduct().getCode() : null;
                    return o.equals(otherUsername) && Objects.equals(p, productCode)
                        && !m.getSender().getUsername().equals(username) && !m.isRead();
                })
                .count();
            dto.setUnreadCount(unread);

            conversationList.add(dto);
        }
        // Sort conversations by latest message time descending
        conversationList.sort((a, b) -> {
            MessageEntity msgA = latestMessageMap.get(a.getOtherUsername() + ":" + (a.getProductCode() != null ? a.getProductCode() : ""));
            MessageEntity msgB = latestMessageMap.get(b.getOtherUsername() + ":" + (b.getProductCode() != null ? b.getProductCode() : ""));
            return msgB.getCreatedAt().compareTo(msgA.getCreatedAt());
        });

        return conversationList;
    }

    private MessageDTO convertToDTO(MessageEntity message) {
        MessageDTO dto = new MessageDTO();
        dto.setId(message.getId());
        dto.setSenderId(message.getSender().getUsername());
        dto.setSenderName(message.getSender().getUsername());
        dto.setReceiverId(message.getReceiver().getUsername());
        dto.setReceiverName(message.getReceiver().getUsername());
        dto.setContent(message.getContent());
        dto.setRead(message.isRead());
        dto.setCreatedAt(message.getCreatedAt());
        dto.setUpdatedAt(message.getUpdatedAt());
        
        // Add product information if available
        if (message.getProduct() != null) {
            dto.setProductCode(message.getProduct().getCode());
            dto.setProductName(message.getProduct().getName());
            dto.setProductImage(message.getProduct().getImagePath());
        }
        
        return dto;
    }
} 