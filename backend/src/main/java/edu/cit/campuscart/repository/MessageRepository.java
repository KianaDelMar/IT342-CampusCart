package edu.cit.campuscart.repository;

import edu.cit.campuscart.entity.MessageEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<MessageEntity, Long> {
    List<MessageEntity> findBySenderUsernameAndReceiverUsernameOrderByCreatedAtDesc(String senderUsername, String receiverUsername);
    List<MessageEntity> findByReceiverUsernameAndIsReadFalseOrderByCreatedAtDesc(String receiverUsername);
    long countByReceiverUsernameAndIsReadFalse(String receiverUsername);
    List<MessageEntity> findBySenderUsernameAndReceiverUsernameAndProductCodeOrderByCreatedAtDesc(
        String senderUsername, String receiverUsername, Integer productCode);
    List<MessageEntity> findBySenderUsernameOrReceiverUsername(String senderUsername, String receiverUsername);
    List<MessageEntity> findBySenderUsernameAndReceiverUsernameOrSenderUsernameAndReceiverUsernameOrderByCreatedAtAsc(
        String sender1, String receiver1, String sender2, String receiver2);
    List<MessageEntity> findBySenderUsernameAndReceiverUsernameAndProductCodeOrSenderUsernameAndReceiverUsernameAndProductCodeOrderByCreatedAtAsc(
        String sender1, String receiver1, Integer productCode1,
        String sender2, String receiver2, Integer productCode2);
    @Query("SELECT m FROM MessageEntity m WHERE ((m.sender.username = :username1 AND m.receiver.username = :username2) OR (m.sender.username = :username2 AND m.receiver.username = :username1)) AND m.product.code = :productCode ORDER BY m.createdAt ASC")
    List<MessageEntity> findConversationByUsersAndProduct(
        @Param("username1") String username1,
        @Param("username2") String username2,
        @Param("productCode") Integer productCode
    );
} 