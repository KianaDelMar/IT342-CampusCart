package edu.cit.campuscart.adapters

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import edu.cit.campuscart.R
import edu.cit.campuscart.models.ChatMessage

class ChatAdapter(
    private val messages: MutableList<ChatMessage>,
    private val currentUserId: String
) : RecyclerView.Adapter<RecyclerView.ViewHolder>() {

    companion object {
        private const val VIEW_TYPE_LEFT = 0
        private const val VIEW_TYPE_RIGHT = 1
    }

    inner class LeftMessageViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        val messageText: TextView = itemView.findViewById(R.id.textLeft)
    }

    inner class RightMessageViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        val messageText: TextView = itemView.findViewById(R.id.textRight)
    }

    override fun getItemViewType(position: Int): Int {
        val message = messages[position]
        return if (message.senderUsername == currentUserId) VIEW_TYPE_RIGHT else VIEW_TYPE_LEFT
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): RecyclerView.ViewHolder {
        val inflater = LayoutInflater.from(parent.context)
        return if (viewType == VIEW_TYPE_RIGHT) {
            val view = inflater.inflate(R.layout.item_message_right, parent, false)
            RightMessageViewHolder(view)
        } else {
            val view = inflater.inflate(R.layout.item_message_left, parent, false)
            LeftMessageViewHolder(view)
        }
    }

    override fun onBindViewHolder(holder: RecyclerView.ViewHolder, position: Int) {
        val message = messages[position]
        if (holder is RightMessageViewHolder) {
            holder.messageText.text = message.message
        } else if (holder is LeftMessageViewHolder) {
            holder.messageText.text = message.message
        }
    }

    override fun getItemCount(): Int = messages.size
}
