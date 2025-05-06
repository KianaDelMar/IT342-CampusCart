package edu.cit.campuscart.pages

import android.icu.text.SimpleDateFormat
import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.sendbird.android.SendbirdChat
import com.sendbird.android.channel.BaseChannel
import com.sendbird.android.channel.GroupChannel
import com.sendbird.android.handler.GroupChannelHandler
import com.sendbird.android.message.BaseMessage
import com.sendbird.android.message.UserMessage
import com.sendbird.android.params.GroupChannelCreateParams
import com.sendbird.android.params.MessageListParams
import com.sendbird.android.params.UserMessageCreateParams
import edu.cit.campuscart.BaseActivity
import edu.cit.campuscart.R
import edu.cit.campuscart.adapters.ChatAdapter
import edu.cit.campuscart.models.ChatMessage
import java.util.Date
import java.util.Locale

class ChatActivity : BaseActivity() {
    private lateinit var recyclerView: RecyclerView
    private lateinit var adapter: ChatAdapter
    private lateinit var messageInput: EditText
    private lateinit var sendButton: Button
    private lateinit var channel: GroupChannel
    private lateinit var otherUsername: String
    private val messages = mutableListOf<ChatMessage>()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_chat)

        recyclerView = findViewById(R.id.messageRecyclerView)
        messageInput = findViewById(R.id.messageInput)
        sendButton = findViewById(R.id.sendButton)

        val currentUserId = SendbirdChat.currentUser?.userId ?: ""

        adapter = ChatAdapter(messages, currentUserId)
        recyclerView.adapter = adapter
        recyclerView.layoutManager = LinearLayoutManager(this)

        // Get recipient username from Intent (for product selection or manual entry)
        // Inside ChatActivity
        val recipientUsername = intent.getStringExtra("otherUserId") ?: ""  // Check if passed via intent
        val recipientField = findViewById<EditText>(R.id.recipientInput)


        // If the recipient username is empty, let the user manually type, otherwise, set the value automatically
        if (recipientUsername.isNotBlank()) {
            recipientField.setText(recipientUsername)
            recipientField.isFocusable = false  // Disable editing
            recipientField.isClickable = false
        } else {
            recipientField.isFocusableInTouchMode = true  // Allow manual entry
            recipientField.isClickable = true
        }

        // Set up SendBird channel
        openChannelWithUser(recipientUsername)

        sendButton.setOnClickListener {
            val text = messageInput.text.toString()
            if (text.isNotBlank()) {
                sendMessage(text)
            }
        }
    }

    private fun openChannelWithUser(username: String) {
        GroupChannel.createChannel(
            GroupChannelCreateParams().apply {
                userIds = listOf(username)
                isDistinct = true
            }
        ) { result, e ->
            if (e == null && result != null) {
                channel = result
                loadPreviousMessages()
                listenForNewMessages()
            }
        }
    }

    private fun loadPreviousMessages() {
        val messageListParams = MessageListParams().apply {
            reverse = false
            previousResultSize = 50
        }

        channel.getMessagesByTimestamp(System.currentTimeMillis(), messageListParams) { messagesList, e ->
            if (e == null && messagesList != null) {
                messages.clear()
                messagesList.filterIsInstance<UserMessage>().forEach {
                    messages.add(
                        ChatMessage(
                            senderUsername = it.sender?.userId ?: "Unknown",
                            message = it.message,
                            timestamp = formatTime(it.createdAt)
                        )
                    )
                }
                adapter.notifyDataSetChanged()
                recyclerView.scrollToPosition(messages.size - 1)
            }
        }
    }

    private fun listenForNewMessages() {
        val handlerId = "CHAT_${channel.url}"
        SendbirdChat.addChannelHandler(handlerId, object : GroupChannelHandler() {
            override fun onMessageReceived(channel: BaseChannel, message: BaseMessage) {
                if (message is UserMessage) {
                    messages.add(
                        ChatMessage(
                            senderUsername = message.sender?.userId ?: "Unknown",
                            message = message.message,
                            timestamp = formatTime(message.createdAt)
                        )
                    )
                    adapter.notifyItemInserted(messages.size - 1)
                    recyclerView.scrollToPosition(messages.size - 1)
                }
            }
        })
    }

    private fun sendMessage(text: String) {
        channel.sendUserMessage(UserMessageCreateParams(text)) { message, e ->
            if (e == null && message != null) {
                messages.add(
                    ChatMessage(
                        senderUsername = message.sender?.userId ?: "Unknown",
                        message = message.message,
                        timestamp = formatTime(message.createdAt)
                    )
                )
                adapter.notifyItemInserted(messages.size - 1)
                recyclerView.scrollToPosition(messages.size - 1)
                messageInput.text.clear()
            }
        }
    }

    private fun formatTime(timeMillis: Long): String {
        return SimpleDateFormat("HH:mm dd/MM", Locale.getDefault()).format(Date(timeMillis))
    }

    override fun onDestroy() {
        SendbirdChat.removeChannelHandler("CHAT_${channel.url}")
        super.onDestroy()
    }
}
