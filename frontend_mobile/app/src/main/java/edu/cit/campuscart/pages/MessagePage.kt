package edu.cit.campuscart.pages

import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.ImageButton
import android.widget.TextView
import android.widget.Toast
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import edu.cit.campuscart.BaseActivity
import edu.cit.campuscart.R
import edu.cit.campuscart.adapters.ConversationAdapter
import edu.cit.campuscart.models.ConversationDTO
import edu.cit.campuscart.utils.RetrofitClient
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class MessagePage : BaseActivity() {

    private lateinit var conversationAdapter: ConversationAdapter
    private lateinit var recyclerView: RecyclerView
    private val conversations = mutableListOf<ConversationDTO>()

    private lateinit var token: String
    private lateinit var currentUser: String

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_messagepage)

        // Initialize views
        val messageBadgeTextView: TextView = findViewById(R.id.messageBadge)
        recyclerView = findViewById(R.id.conversationList)

        // Load from shared preferences
        val sharedPref = getSharedPreferences("CampusCartPrefs", Context.MODE_PRIVATE)
        token = "Bearer ${sharedPref.getString("authToken", "") ?: ""}"
        currentUser = sharedPref.getString("loggedInUsername", "") ?: ""

        if (currentUser.isEmpty()) {
            Toast.makeText(this, "User not found", Toast.LENGTH_SHORT).show()
            finish()
            return
        }

        setupRecyclerView()
        setupNavigationButtons()
        updateMessageBadgeFromApi(messageBadgeTextView)
        loadConversations()
    }

    private fun setupRecyclerView() {
        recyclerView.layoutManager = LinearLayoutManager(this)
        conversationAdapter = ConversationAdapter(conversations, currentUser, token) { conversation ->
            // When a conversation is clicked
            val otherUser = if (conversation.participant1 == currentUser) conversation.participant2 else conversation.participant1
            val intent = Intent(this, ChatActivity::class.java).apply {
                putExtra("recipientUsername", otherUser)
                putExtra("productCode", conversation.productCode ?: -1)
                // Add product details if available
                conversation.productName?.let { putExtra("productName", it) }
                conversation.productImagePath?.let { putExtra("productImagePath", it) }
                conversation.productPrice?.let { putExtra("productPrice", it) }
                conversation.productDescription?.let { putExtra("productDescription", it) }
            }
            startActivity(intent)
        }
        recyclerView.adapter = conversationAdapter
    }

    private fun updateMessageBadgeFromApi(badgeTextView: TextView) {
        lifecycleScope.launch {
            try {
                val response = RetrofitClient.instance.getUnreadMessageCount(token, currentUser)
                withContext(Dispatchers.Main) {
                    if (response.isSuccessful) {
                        val count = response.body() ?: 0
                        if (count > 0) {
                            badgeTextView.text = count.toString()
                            badgeTextView.visibility = View.VISIBLE
                        } else {
                            badgeTextView.visibility = View.GONE
                        }
                    } else {
                        badgeTextView.visibility = View.GONE
                    }
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    badgeTextView.visibility = View.GONE
                }
            }
        }
    }

    private fun loadConversations() {
        lifecycleScope.launch {
            try {
                val response = RetrofitClient.instance.getConversations(token, currentUser)
                if (response.isSuccessful) {
                    conversations.clear()
                    conversations.addAll(response.body() ?: emptyList())
                    conversationAdapter.notifyDataSetChanged()
                } else {
                    Toast.makeText(this@MessagePage, "Failed to load conversations", Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                Toast.makeText(this@MessagePage, "An error occurred: ${e.message}", Toast.LENGTH_LONG).show()
            }
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
        findViewById<ImageButton>(R.id.btnMessage).setOnClickListener {
            loadConversations() // refresh
        }
    }

    override fun onResume() {
        super.onResume()
        // Refresh conversations and badge when returning to this activity
        loadConversations()
        updateMessageBadgeFromApi(findViewById(R.id.messageBadge))
    }
}