package edu.cit.campuscart.adapters

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import edu.cit.campuscart.R
import edu.cit.campuscart.models.ConversationDTO
import edu.cit.campuscart.models.MessageDTO

class ConversationAdapter(
    private val conversations: List<ConversationDTO>,
    private val currentUser: String,
    private val token: String,
    private val onConversationClick: (ConversationDTO) -> Unit
) : RecyclerView.Adapter<ConversationAdapter.ViewHolder>() {

    inner class ViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        val usernameView: TextView = itemView.findViewById(R.id.username_text)
        val lastMessageView: TextView = itemView.findViewById(R.id.last_message_text)
        val statusIcon: ImageView = itemView.findViewById(R.id.readStatusIcon)

        fun bind(convo: ConversationDTO) {
            // Set other user's name
            val otherUser = if (convo.participant1 == currentUser) convo.participant2 else convo.participant1
            usernameView.text = otherUser

            // Set last message
            val latestMessage: MessageDTO? = convo.lastMessage
            lastMessageView.text = latestMessage?.content ?: "No messages yet"

            // Set unread status
            val isUnread = latestMessage?.receiver == currentUser && !latestMessage.isRead
            statusIcon.setImageResource(if (isUnread) R.drawable.markunread else R.drawable.markread)
            statusIcon.visibility = if (latestMessage != null) View.VISIBLE else View.GONE

            // Set click listener
            itemView.setOnClickListener {
                onConversationClick(convo)
            }
        }
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val view = LayoutInflater.from(parent.context).inflate(R.layout.item_conversation, parent, false)
        return ViewHolder(view)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        holder.bind(conversations[position])
    }

    override fun getItemCount(): Int = conversations.size
}