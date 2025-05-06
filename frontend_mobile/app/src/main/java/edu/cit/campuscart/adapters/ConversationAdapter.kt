package edu.cit.campuscart.adapters

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import edu.cit.campuscart.R
import edu.cit.campuscart.models.ConversationPreview

class ConversationAdapter(
    private val conversations: List<ConversationPreview>,
    private val onClick: (ConversationPreview) -> Unit
) : RecyclerView.Adapter<ConversationAdapter.ConversationViewHolder>() {

    inner class ConversationViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val username = view.findViewById<TextView>(R.id.username)
        val message = view.findViewById<TextView>(R.id.lastMessage)
        val timestamp = view.findViewById<TextView>(R.id.timestamp)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ConversationViewHolder {
        val view = LayoutInflater.from(parent.context).inflate(R.layout.item_conversation, parent, false)
        return ConversationViewHolder(view)
    }

    override fun onBindViewHolder(holder: ConversationViewHolder, position: Int) {
        val item = conversations[position]
        holder.username.text = item.username
        holder.message.text = item.lastMessage
        holder.timestamp.text = item.timestamp
        holder.itemView.setOnClickListener { onClick(item) }
    }

    override fun getItemCount(): Int = conversations.size
}
