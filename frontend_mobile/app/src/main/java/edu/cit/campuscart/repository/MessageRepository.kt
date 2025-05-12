package edu.cit.campuscart.repository

import edu.cit.campuscart.api.APIService
import edu.cit.campuscart.models.MessageDTO

class MessageRepository(private val service: APIService) {

    suspend fun sendMessage(token: String, message: MessageDTO) =
        service.sendMessage("Bearer $token", message)

    suspend fun getConversation(token: String, user1: String, user2: String) =
        service.getConversation("Bearer $token", user1, user2)

    suspend fun markMessageAsRead(token: String, messageId: Long) =
        service.markAsRead("Bearer $token", messageId)

    suspend fun getUnreadMessageCount(token: String, username: String) =
        service.getUnreadMessageCount("Bearer $token", username)

    suspend fun getProductConversation(token: String, user1: String, user2: String, productCode: Int) =
        service.getProductConversation("Bearer $token", user1, user2, productCode)

    suspend fun getConversations(token: String, username: String) =
        service.getConversations("Bearer $token", username)
}
