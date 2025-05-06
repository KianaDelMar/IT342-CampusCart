package edu.cit.campuscart.pages

import android.content.Intent
import android.os.Bundle
import android.widget.EditText
import android.widget.ImageButton
import androidx.appcompat.app.AlertDialog
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.sendbird.android.SendbirdChat
import com.sendbird.android.channel.GroupChannel
import com.sendbird.android.message.UserMessage
import com.sendbird.android.params.GroupChannelListQueryParams
import com.sendbird.android.params.GroupChannelCreateParams
import edu.cit.campuscart.BaseActivity
import edu.cit.campuscart.R
import edu.cit.campuscart.adapters.ConversationAdapter
import edu.cit.campuscart.models.ConversationPreview
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class MessagePage : BaseActivity() {

    private lateinit var recyclerView: RecyclerView
    private lateinit var adapter: ConversationAdapter

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_messagepage)

        recyclerView = findViewById(R.id.conversationList)
        recyclerView.layoutManager = LinearLayoutManager(this)

        findViewById<ImageButton>(R.id.btnNewMessage).setOnClickListener {
            showNewMessageDialog()
        }
        setupNavigationButtons()
        loadConversations()
    }

    private fun loadConversations() {
        val query = GroupChannel.createMyGroupChannelListQuery(
            GroupChannelListQueryParams().apply {
                includeEmpty = false
            }
        )

        query.next { channels, e ->
            if (e != null) return@next
            val currentUserId = SendbirdChat.currentUser?.userId

            val previews = channels?.map {
                val lastMessage = it.lastMessage?.message ?: ""
                val time = SimpleDateFormat("dd/MM/yyyy HH:mm", Locale.getDefault())
                    .format(Date(it.lastMessage?.createdAt ?: 0))

                val otherUser = it.members.firstOrNull { m -> m.userId != currentUserId }
                val displayLastMessage = if (it.lastMessage is UserMessage && (it.lastMessage as UserMessage).sender?.userId == currentUserId) {
                    "You: $lastMessage"
                } else {
                    lastMessage
                }

                ConversationPreview(
                    userId = otherUser?.userId ?: "",
                    username = otherUser?.nickname ?: "Unknown",
                    lastMessage = displayLastMessage,
                    timestamp = time
                )
            }

            adapter = ConversationAdapter(previews.orEmpty()) { selected ->
                val intent = Intent(this, ChatActivity::class.java)
                intent.putExtra("userId", selected.userId)
                startActivity(intent)
            }

            recyclerView.adapter = adapter
        }
    }

    private fun showNewMessageDialog() {
        val editText = EditText(this)
        editText.hint = "Enter user ID"

        // In the MessagePage dialog where the new message is created
        AlertDialog.Builder(this)
            .setTitle("New Message")
            .setView(editText)
            .setPositiveButton("Start") { _, _ ->
                val userId = editText.text.toString()
                GroupChannel.createChannel(
                    GroupChannelCreateParams().apply {
                        userIds = listOf(userId)
                        isDistinct = true
                    }
                ) { channel, e ->
                    if (channel != null) {
                        val intent = Intent(this, ChatActivity::class.java)
                        intent.putExtra("otherUserId", userId)  // Pass the userId to ChatActivity
                        startActivity(intent)
                    }
                }
            }
            .setNegativeButton("Cancel", null)
            .show()
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
