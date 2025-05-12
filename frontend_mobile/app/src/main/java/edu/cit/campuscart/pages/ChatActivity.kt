package edu.cit.campuscart.pages

import android.content.Context
import android.content.Intent
import android.icu.text.SimpleDateFormat
import android.os.Bundle
import android.widget.*
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.squareup.picasso.Picasso
import edu.cit.campuscart.BaseActivity
import edu.cit.campuscart.R
import edu.cit.campuscart.adapters.MessageAdapter
import edu.cit.campuscart.models.MessageDTO
import edu.cit.campuscart.utils.RetrofitClient
import kotlinx.coroutines.launch
import java.util.*

class ChatActivity : BaseActivity() {

    private lateinit var messageAdapter: MessageAdapter
    private lateinit var recyclerView: RecyclerView
    private val messages = mutableListOf<MessageDTO>()

    private lateinit var token: String
    private lateinit var currentUser: String
    private lateinit var otherUser: String
    private var productCode: Int? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_chat)

        // Initialize views
        val backButton = findViewById<Button>(R.id.btnback)
        val editMessage = findViewById<EditText>(R.id.editMessage)
        val buttonSend = findViewById<ImageButton>(R.id.buttonSend)
        recyclerView = findViewById(R.id.recyclerMessages)

        // Load from shared preferences
        val sharedPref = getSharedPreferences("CampusCartPrefs", Context.MODE_PRIVATE)
        token = "Bearer ${sharedPref.getString("authToken", "") ?: ""}"
        currentUser = sharedPref.getString("loggedInUsername", "") ?: ""

        if (currentUser.isEmpty()) {
            Toast.makeText(this, "User not found", Toast.LENGTH_SHORT).show()
            finish()
            return
        }

        // Get otherUser and productCode from intent
        otherUser = intent.getStringExtra("recipientUsername") ?: ""
        productCode = intent.getIntExtra("productCode", -1).takeIf { it != -1 }

        if (otherUser.isEmpty()) {
            Toast.makeText(this, "Recipient not found", Toast.LENGTH_SHORT).show()
            finish()
            return
        }

        // Set up UI
        setupUI()
        setupRecyclerView()
        setupClickListeners(backButton, editMessage, buttonSend)
        loadMessages()
    }

    private fun setupUI() {
        // Set "To: sellerUsername"
        findViewById<TextView>(R.id.recipient_label).text = "To: $otherUser"

        // Retrieve product info from intent
        val productName = intent.getStringExtra("productName")
        val productImagePath = intent.getStringExtra("productImagePath")
        val productPrice = intent.getDoubleExtra("productPrice", 0.0)
        val productDescription = intent.getStringExtra("productDescription")

        // Set product info
        findViewById<TextView>(R.id.product_info)?.apply {
            text = "$productName\n₱${String.format("%.2f", productPrice)}\n$productDescription"
        }

        val productImageView = findViewById<ImageView>(R.id.product_image)
        if (productImagePath != null && productImageView != null) {
            val baseUrl = "https://campuscart-online-marketplace-system-production.up.railway.app/"
            Picasso.get()
                .load("$baseUrl$productImagePath")
                .placeholder(R.drawable.defaultimage)
                .error(R.drawable.defaultimage)
                .into(productImageView)
        }
    }

    private fun setupRecyclerView() {
        recyclerView.layoutManager = LinearLayoutManager(this).apply {
            stackFromEnd = true // Messages will start from bottom
        }
        messageAdapter = MessageAdapter(currentUser)
        recyclerView.adapter = messageAdapter
    }

    private fun setupClickListeners(
        backButton: Button,
        editMessage: EditText,
        buttonSend: ImageButton
    ) {
        backButton.setOnClickListener {
            val intent = Intent(this, MessagePage::class.java)
            startActivity(intent)
            finish()
        }

        buttonSend.setOnClickListener {
            val content = editMessage.text.toString().trim()
            if (content.isNotBlank()) {
                val message = MessageDTO(
                    sender = currentUser,
                    receiver = otherUser,
                    content = content,
                    timestamp = getCurrentTime(),
                    productCode = productCode
                )
                sendMessage(message)
                editMessage.text.clear()
            }
        }

        // Send message on Enter key
        editMessage.setOnEditorActionListener { _, actionId, _ ->
            if (actionId == android.view.inputmethod.EditorInfo.IME_ACTION_SEND) {
                val content = editMessage.text.toString().trim()
                if (content.isNotBlank()) {
                    val message = MessageDTO(
                        sender = currentUser,
                        receiver = otherUser,
                        content = content,
                        timestamp = getCurrentTime(),
                        productCode = productCode
                    )
                    sendMessage(message)
                    editMessage.text.clear()
                }
                true
            } else {
                false
            }
        }
    }

    private fun loadMessages() {
        lifecycleScope.launch {
            try {
                val response = if (productCode != null) {
                    RetrofitClient.instance.getProductConversation(token, currentUser, otherUser, productCode!!)
                } else {
                    RetrofitClient.instance.getConversation(token, currentUser, otherUser)
                }

                if (response.isSuccessful) {
                    messages.clear()
                    messages.addAll(response.body() ?: emptyList())
                    messageAdapter.setMessages(messages)
                    messageAdapter.notifyDataSetChanged()
                    recyclerView.scrollToPosition(messages.size - 1)
                } else {
                    Toast.makeText(this@ChatActivity, "Failed to load messages", Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                Toast.makeText(this@ChatActivity, "Error: ${e.message}", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun sendMessage(message: MessageDTO) {
        lifecycleScope.launch {
            try {
                val response = RetrofitClient.instance.sendMessage(token, message)
                if (response.isSuccessful) {
                    // Add message to local list and update UI
                    messages.add(message)
                    messageAdapter.addMessage(message)
                    messageAdapter.notifyItemInserted(messages.size - 1)
                    recyclerView.scrollToPosition(messages.size - 1)
                } else {
                    Toast.makeText(this@ChatActivity, "Failed to send message", Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                Toast.makeText(this@ChatActivity, "Error: ${e.message}", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun getCurrentTime(): String {
        return SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.getDefault()).format(Date())
    }
}