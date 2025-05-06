package edu.cit.campuscart.pages

import android.os.Bundle
import android.util.Log
import android.widget.EditText
import android.widget.ImageButton
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.sendbird.android.channel.GroupChannel
import com.sendbird.android.message.BaseMessage
import edu.cit.campuscart.BaseActivity
import edu.cit.campuscart.R
import edu.cit.campuscart.adapters.MessageAdapter

class ChatDetailActivity : BaseActivity() {

    private lateinit var recyclerView: RecyclerView
    private lateinit var messageInput: EditText
    private lateinit var sendButton: ImageButton
    private lateinit var adapter: MessageAdapter
    private lateinit var channel: GroupChannel
    private lateinit var messageList: MutableList<BaseMessage>

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_chat_detail)

        recyclerView = findViewById(R.id.recyclerView)
        messageInput = findViewById(R.id.messageInput)
        sendButton = findViewById(R.id.sendButton)

        // Get the channel URL passed from the previous activity
        val channelUrl = intent.getStringExtra("channel_url") ?: return
        loadChannel(channelUrl)

        // Set up RecyclerView
        recyclerView.layoutManager = LinearLayoutManager(this)
        adapter = MessageAdapter(messageList)
        recyclerView.adapter = adapter

        // Send button action
        sendButton.setOnClickListener {
            val message = messageInput.text.toString()
            if (message.isNotEmpty()) {
                sendMessage(message)
            }
        }
    }

    private fun loadChannel(channelUrl: String) {
        // Fetch the group channel
        GroupChannel.getChannel(channelUrl, GroupChannelGetHandler { groupChannel, e ->
            if (e != null) {
                Log.e("ChatDetailActivity", "Error fetching channel: ${e.message}")
                return@GroupChannelGetHandler
            }

            channel = groupChannel
            loadMessages() // Load existing messages
            subscribeForNewMessages() // Subscribe to new messages
        })
    }

    private fun loadMessages() {
        // Get previous messages in the channel
        val query = channel.createPreviousMessageListQuery()
        query.load(30) { messages, e ->
            if (e != null) {
                Log.e("ChatDetailActivity", "Error loading messages: ${e.message}")
                return@load
            }

            messageList.clear()
            messageList.addAll(messages)
            adapter.notifyDataSetChanged()

            // Auto-scroll to the latest message
            recyclerView.scrollToPosition(messageList.size - 1)
        }
    }

    private fun sendMessage(message: String) {
        val userMessage = UserMessageParams(message)
        channel.sendUserMessage(userMessage, UserMessageSendHandler { message, e ->
            if (e != null) {
                Log.e("ChatDetailActivity", "Error sending message: ${e.message}")
                return@UserMessageSendHandler
            }

            // Add the sent message to the list
            messageList.add(message)
            adapter.notifyItemInserted(messageList.size - 1)
            recyclerView.scrollToPosition(messageList.size - 1)

            messageInput.text.clear() // Clear the input field after sending
        })
    }

    private fun subscribeForNewMessages() {
        // Subscribe to new messages in the channel
        channel.markAsRead()
        channel.setMessageReceivedHandler { message ->
            if (message is UserMessage) {
                messageList.add(message)
                adapter.notifyItemInserted(messageList.size - 1)
                recyclerView.scrollToPosition(messageList.size - 1)
            }
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        // Unsubscribe from the channel when the activity is destroyed
        channel.removeMessageReceivedHandler()
    }
}
