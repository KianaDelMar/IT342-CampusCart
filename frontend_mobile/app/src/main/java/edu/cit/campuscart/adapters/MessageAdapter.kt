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

class MessageAdapter(private val messages: List<BaseMessage>) : RecyclerView.Adapter<MessageAdapter.MessageViewHolder>() {

    inner class MessageViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val messageText: TextView = view.findViewById(R.id.messageText)
        val timestamp: TextView = view.findViewById(R.id.timestamp)

        fun bind(message: BaseMessage) {
            if (message is UserMessage) {
                messageText.text = message.message

                val time = message.createdAt
                val sdf = SimpleDateFormat("hh:mm a", Locale.getDefault())
                timestamp.text = sdf.format(Date(time))
            }
        }
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): MessageViewHolder {
        val view = LayoutInflater.from(parent.context).inflate(R.layout.item_message, parent, false)
        return MessageViewHolder(view)
    }

    override fun onBindViewHolder(holder: MessageViewHolder, position: Int) {
        holder.bind(messages[position])
    }

    override fun getItemCount() = messages.size
}
