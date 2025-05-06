package edu.cit.campuscart.adapters

import android.icu.text.SimpleDateFormat
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.sendbird.android.SendbirdChat
import com.sendbird.android.channel.GroupChannel
import com.sendbird.android.message.UserMessage
import edu.cit.campuscart.R
import java.util.Date
import java.util.Locale

class ChatPreviewAdapter(
    private var channels: List<GroupChannel>,
    private val onClick: (GroupChannel) -> Unit,
    private val messages: (Any) -> Unit
) : RecyclerView.Adapter<ChatPreviewAdapter.ViewHolder>() {

    inner class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val username: TextView = view.findViewById(R.id.usernameText)
        val messagePreview: TextView = view.findViewById(R.id.messagePreview)
        val timestamp: TextView = view.findViewById(R.id.messageTime)

        fun bind(channel: GroupChannel) {
            val otherUser = channel.members.firstOrNull { it.userId != SendbirdChat.currentUser?.userId }
            val lastMessage = channel.lastMessage as? UserMessage

            username.text = otherUser?.nickname ?: "Unknown"
            messagePreview.text = lastMessage?.message ?: "No messages yet"

            val time = lastMessage?.createdAt ?: 0L
            val sdf = SimpleDateFormat("MMM dd, hh:mm a", Locale.getDefault())
            timestamp.text = sdf.format(Date(time))

            itemView.setOnClickListener { onClick(channel) }
        }
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val view = LayoutInflater.from(parent.context).inflate(R.layout.item_chat_preview, parent, false)
        return ViewHolder(view)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        holder.bind(channels[position])
    }

    override fun getItemCount() = channels.size

    fun submitList(newList: List<GroupChannel>) {
        channels = newList
        notifyDataSetChanged()
    }

    fun addMessage(message: UserMessage) {
        messages.add(message)
        notifyItemInserted(messages.size - 1) // Notify that a new item has been added
    }
}
