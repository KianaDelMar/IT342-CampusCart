package edu.cit.campuscart.pages

import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.widget.EditText
import android.widget.ImageButton
import android.widget.ImageView
import android.widget.TextView
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.bumptech.glide.Glide
import com.sendbird.android.SendbirdChat
import com.sendbird.android.channel.BaseChannel
import com.sendbird.android.channel.GroupChannel
import com.sendbird.android.channel.query.GroupChannelListQueryOrder
import com.sendbird.android.params.GroupChannelListQueryParams
import com.sendbird.android.handler.GroupChannelHandler
import com.sendbird.android.message.BaseMessage
import com.sendbird.android.message.UserMessage
import com.sendbird.android.params.MessageListParams
import edu.cit.campuscart.BaseActivity
import edu.cit.campuscart.R
import edu.cit.campuscart.adapters.ChatAdapter
import edu.cit.campuscart.adapters.ChatPreviewAdapter
import edu.cit.campuscart.adapters.ProfileAdapter
import edu.cit.campuscart.utils.Constants

class MessagePage : BaseActivity() {

    private lateinit var toUsernameTextView: TextView
    private lateinit var messageInput: EditText
    private lateinit var sendButton: ImageButton
    private lateinit var recyclerView: RecyclerView
    private lateinit var adapter: ChatPreviewAdapter
    private lateinit var messageList: MutableList<UserMessage>

    private var groupChannel: GroupChannel? = null
    private var currentUserId: String? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_messagepage)

        setupNavigationButtons()

        recyclerView = findViewById(R.id.notificationRecyclerView)
        toUsernameTextView = findViewById(R.id.toUsernameTextView)
        sendButton = findViewById(R.id.sendButton)
        messageInput = findViewById(R.id.messageInput)

        messageList = mutableListOf()
        currentUserId = SendbirdChat.currentUser?.userId ?: "unknown"
        recyclerView.layoutManager = LinearLayoutManager(this)
        recyclerView.adapter = adapter

        val channelUrl = intent.getStringExtra("channel_url") ?: return
        val otherUserId = intent.getStringExtra("otherUserId")
        val otherUserPhoto = intent.getStringExtra("otherUserPhoto")

        val adapter = ChatPreviewAdapter(emptyList()) { channel ->
            val intent = Intent(this, ChatDetailActivity::class.java).apply {
                putExtra("channel_url", channel.url)
            }
            startActivity(intent)
        }
        recyclerView.adapter = adapter


        val sellerUsername = intent.getStringExtra("otherUserId") ?: "Unknown Seller"
        toUsernameTextView.text = "To: $sellerUsername"

        if (channelUrl != null) {
            // Open specific channel (e.g., from ProductDetailDialogFragment)
            loadChannel(channelUrl)
        } else {
            // User navigated from Home or other page — show their existing chats
            val query = GroupChannel.createMyGroupChannelListQuery(
                GroupChannelListQueryParams().apply {
                    includeEmpty = false
                    limit = 100
                    order = GroupChannelListQueryOrder.LATEST_LAST_MESSAGE
                }
            )

            query.next { channels, e ->
                if (e != null) {
                    Log.e("MessagePage", "Failed to fetch chats: ${e.message}")
                    return@next
                }

                adapter.submitList(channels)
            }
        }

        sendButton.setOnClickListener {
            val text = messageInput.text.toString()
            if (text.isNotBlank()) {
                groupChannel?.sendUserMessage(text) { message, e ->
                    if (e == null && message is UserMessage) {
                        adapter.addMessage(message)
                        recyclerView.scrollToPosition(adapter.itemCount - 1)
                        messageInput.setText("")
                    }
                }
            }
        }

        SendbirdChat.addChannelHandler("CHAT_HANDLER", object : GroupChannelHandler() {
            override fun onMessageReceived(channel: BaseChannel, message: BaseMessage) {
                Log.d("MessagePage", "Message received: ${message.message}")
                if (channel.url == groupChannel?.url && message is UserMessage) {
                    adapter.addMessage(message)

                    recyclerView.scrollToPosition(adapter.itemCount - 1)
                }
            }
        })
    }

    private fun loadPreviousMessages() {
        groupChannel?.getMessagesByTimestamp(
            Long.MAX_VALUE,
            MessageListParams()
        ) { messages, e ->
            if (e == null && messages != null) {
                Log.d("MessagePage", "Messages fetched: ${messages.size}")
                messageList.clear()
                messages.filterIsInstance<UserMessage>().forEach {
                    messageList.add(it)
                }
                adapter.notifyDataSetChanged()
                recyclerView.scrollToPosition(adapter.itemCount - 1)
            } else {
                Log.e("MessagePage", "Error fetching messages: ${e?.message}")
            }
        }
    }

    private fun loadChannel(channelUrl: String) {
        GroupChannel.getChannel(channelUrl) { channel, e ->
            if (e != null) {
                Log.e("SendBird", "Failed to load channel: ${e.message}")
            } else {
                groupChannel = channel
                loadPreviousMessages()

                val profileRecyclerView = findViewById<RecyclerView>(R.id.profileRecyclerView)
                profileRecyclerView.layoutManager = LinearLayoutManager(this, LinearLayoutManager.HORIZONTAL, false)

                groupChannel?.members?.let { members ->
                    val profileAdapter = ProfileAdapter(members) { selectedMember ->
                        filterMessagesFromUser(selectedMember.userId)
                    }
                    profileRecyclerView.adapter = profileAdapter
                }

                val otherUser = groupChannel?.members?.firstOrNull { it.userId != currentUserId }
                toUsernameTextView.text = "To: ${otherUser?.userId ?: "Unknown"}"
            }
        }
    }

    private fun filterMessagesFromUser(userId: String) {
        groupChannel?.getMessagesByTimestamp(
            Long.MAX_VALUE,
            MessageListParams()
        ) { messages, e ->
            if (e == null && messages != null) {
                messageList.clear()

                val filteredMessages = messages.filterIsInstance<UserMessage>()
                    .filter { it.sender?.userId == userId }

                messageList.addAll(filteredMessages)

                adapter.notifyDataSetChanged()
                recyclerView.scrollToPosition(adapter.itemCount - 1)
            }
        }
    }

    private fun loadProfileImage(context: Context, imageView: ImageView, photoFilename: String?) {
        if (!photoFilename.isNullOrEmpty()) {
            Glide.with(context)
                .load("${Constants.BASE_URL}uploads/$photoFilename")
                .placeholder(R.drawable.defaultphoto)
                .error(R.drawable.defaultphoto)
                .into(imageView)
        } else {
            imageView.setImageResource(R.drawable.defaultphoto)
        }
    }

    private fun setupNavigationButtons() {
        findViewById<ImageButton>(R.id.btnNotifs).setOnClickListener {
            startActivity(Intent(this, NotificationPage::class.java))
        }
        findViewById<ImageButton>(R.id.btnHome).setOnClickListener {
            startActivity(Intent(this, HomePage::class.java))
        }
        findViewById<ImageButton>(R.id.btnLikes).setOnClickListener {
            startActivity(Intent(this, LikePage::class.java))
        }
        findViewById<ImageButton>(R.id.btnBrowse).setOnClickListener {
            startActivity(Intent(this, BrowsePage::class.java))
        }
        findViewById<ImageButton>(R.id.btnProfile).setOnClickListener {
            startActivity(Intent(this, ProfilePage::class.java))
        }
        findViewById<ImageButton>(R.id.btnMessage).setOnClickListener { }
    }
}
