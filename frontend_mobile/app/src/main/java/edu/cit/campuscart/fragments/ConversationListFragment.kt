package edu.cit.campuscart.fragments

import android.os.Bundle
import android.view.View
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import edu.cit.campuscart.R
//import edu.cit.campuscart.adapters.ConversationAdapter
import edu.cit.campuscart.models.ConversationDTO
import edu.cit.campuscart.utils.RetrofitClient
import kotlinx.coroutines.launch

class ConversationListFragment : Fragment(R.layout.fragment_conversation_list) {

    private val conversations = mutableListOf<ConversationDTO>()

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        val token = "your_jwt_token"
        val currentUser = "userA"
        val recycler = view.findViewById<RecyclerView>(R.id.recyclerConversations)
        recycler.layoutManager = LinearLayoutManager(requireContext())

      /*  val adapter = ConversationAdapter(conversations) { conversation ->
            val action = ConversationListFragmentDirections
                .actionConversationListFragmentToMessagePage(currentUser, conversation.username)
            findNavController().navigate(action)
        }
        recycler.adapter = adapter*/

        lifecycleScope.launch {
            val response = RetrofitClient.instance.getConversations("Bearer $token", currentUser)
            if (response.isSuccessful) {
                conversations.clear()
                conversations.addAll(response.body() ?: emptyList())
            //    adapter.notifyDataSetChanged()
            } else {
                Toast.makeText(context, "Failed to load conversations", Toast.LENGTH_SHORT).show()
            }
        }
    }
}