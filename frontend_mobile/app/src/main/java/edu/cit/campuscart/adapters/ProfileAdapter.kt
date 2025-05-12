package edu.cit.campuscart.adapters

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import androidx.recyclerview.widget.RecyclerView
import com.bumptech.glide.Glide
import edu.cit.campuscart.R
import edu.cit.campuscart.utils.Constants
/*
class ProfileAdapter(
    private val members: List<Member>,  // Members from the group channel
    private val onClick: (Member) -> Unit  // This will handle item click to filter messages
) : RecyclerView.Adapter<ProfileAdapter.ProfileViewHolder>() {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ProfileViewHolder {
        val view = LayoutInflater.from(parent.context).inflate(R.layout.item_profile_pic, parent, false)
        return ProfileViewHolder(view)
    }

    override fun onBindViewHolder(holder: ProfileViewHolder, position: Int) {
        val member = members[position]

        // Load profile image using Glide or Picasso
        Glide.with(holder.itemView.context)
            .load("${Constants.BASE_URL}uploads/${member.profileUrl}")
            .placeholder(R.drawable.defaultphoto)
            .error(R.drawable.defaultphoto)
            .into(holder.profileImage)

        // Set the click listener
        holder.itemView.setOnClickListener {
            onClick(member)  // Trigger the click action to filter messages by user
        }
    }

    override fun getItemCount(): Int = members.size

    // ViewHolder class to hold reference to the profile picture
    class ProfileViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val profileImage: ImageView = view.findViewById(R.id.imageProfile)
    }
}
*/