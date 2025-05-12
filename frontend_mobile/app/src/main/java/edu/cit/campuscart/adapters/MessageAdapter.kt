package edu.cit.campuscart.adapters

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import edu.cit.campuscart.R
import edu.cit.campuscart.models.MessageDTO
import java.text.SimpleDateFormat
import java.util.*

class MessageAdapter(
    private val loggedInUsername: String
) : RecyclerView.Adapter<RecyclerView.ViewHolder>() {

    private val messages = mutableListOf<MessageDTO>()
    private val dateFormat = SimpleDateFormat("hh:mm a", Locale.getDefault())

    companion object {
        private const val VIEW_TYPE_SENT = 1
        private const val VIEW_TYPE_RECEIVED = 0
    }

    override fun getItemViewType(position: Int): Int {
        return if (messages[position].sender == loggedInUsername) VIEW_TYPE_SENT else VIEW_TYPE_RECEIVED
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): RecyclerView.ViewHolder {
        return if (viewType == VIEW_TYPE_SENT) {
            val view = LayoutInflater.from(parent.context)
                .inflate(R.layout.item_message_right, parent, false)
            RightMessageViewHolder(view)
        } else {
            val view = LayoutInflater.from(parent.context)
                .inflate(R.layout.item_message_left, parent, false)
            LeftMessageViewHolder(view)
        }
    }

    override fun onBindViewHolder(holder: RecyclerView.ViewHolder, position: Int) {
        val message = messages[position]
        when (holder) {
            is RightMessageViewHolder -> {
                holder.messageText.text = message.content
                holder.timeText.text = formatTimestamp(message.timestamp)
            }
            is LeftMessageViewHolder -> {
                holder.messageText.text = message.content
                holder.timeText.text = formatTimestamp(message.timestamp)
            }
        }
    }

    override fun getItemCount(): Int = messages.size

    fun setMessages(newMessages: List<MessageDTO>) {
        messages.clear()
        messages.addAll(newMessages)
        notifyDataSetChanged()
    }

    fun addMessage(message: MessageDTO) {
        messages.add(message)
        notifyItemInserted(messages.size - 1)
    }

    private fun formatTimestamp(timestamp: String): String {
        return try {
            val date = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.getDefault()).parse(timestamp)
            date?.let { dateFormat.format(it) } ?: ""
        } catch (e: Exception) {
            ""
        }
    }

    class LeftMessageViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val messageText: TextView = view.findViewById(R.id.textLeft)
        val timeText: TextView = view.findViewById(R.id.timeLeft)
    }

    class RightMessageViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val messageText: TextView = view.findViewById(R.id.textRight)
        val timeText: TextView = view.findViewById(R.id.timeRight)
    }
}