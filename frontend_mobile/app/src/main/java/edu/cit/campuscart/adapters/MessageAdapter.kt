package edu.cit.campuscart.adapters

import android.icu.text.SimpleDateFormat
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.sendbird.android.message.BaseMessage
import com.sendbird.android.message.UserMessage
import edu.cit.campuscart.R
import java.util.Date
import java.util.Locale

class MessageAdapter(private val loggedInUsername: String) : RecyclerView.Adapter<RecyclerView.ViewHolder>() {

    private val messages = mutableListOf<BaseMessage>()

    override fun getItemViewType(position: Int): Int {
        return if (messages[position].sender?.userId == loggedInUsername) 1 else 0
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): RecyclerView.ViewHolder {
        return if (viewType == 1) {
            val view = LayoutInflater.from(parent.context).inflate(R.layout.item_message_right, parent, false)
            RightMessageViewHolder(view)
        } else {
            val view = LayoutInflater.from(parent.context).inflate(R.layout.item_message_left, parent, false)
            LeftMessageViewHolder(view)
        }
    }

    override fun onBindViewHolder(holder: RecyclerView.ViewHolder, position: Int) {
        val message = messages[position]
        if (holder is LeftMessageViewHolder) {
            holder.messageText.text = message.message
        } else if (holder is RightMessageViewHolder) {
            holder.messageText.text = message.message
        }
    }

    override fun getItemCount(): Int = messages.size

    fun setMessages(newMessages: List<BaseMessage>) {
        messages.clear()
        messages.addAll(newMessages)
        notifyDataSetChanged()
    }

    fun addMessage(message: BaseMessage) {
        messages.add(message)
        notifyItemInserted(messages.size - 1)
    }

    class LeftMessageViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val messageText: TextView = view.findViewById(R.id.textLeft)
    }

    class RightMessageViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val messageText: TextView = view.findViewById(R.id.textRight)
    }
}
