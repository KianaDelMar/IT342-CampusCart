package edu.cit.campuscart.fragments

import android.app.AlertDialog
import android.app.Dialog
import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity.MODE_PRIVATE
import androidx.fragment.app.DialogFragment
import com.sendbird.android.channel.GroupChannel
import com.sendbird.android.params.GroupChannelCreateParams
import com.sendbird.android.params.GroupChannelListQueryParams
import com.squareup.picasso.Picasso
import edu.cit.campuscart.R
import edu.cit.campuscart.models.Products
import edu.cit.campuscart.pages.ChatActivity
import edu.cit.campuscart.utils.Constants
import edu.cit.campuscart.utils.PreferenceUtils

class ProductDetailDialogFragment : DialogFragment() {

    companion object {
        private const val ARG_PRODUCT = "product"
        private val likedProducts = mutableSetOf<String>()
        fun newInstance(product: Products): ProductDetailDialogFragment {
            val fragment = ProductDetailDialogFragment()
            val args = Bundle()
            args.putSerializable(ARG_PRODUCT, product)
            fragment.arguments = args
            return fragment
        }
    }

    override fun onCreateDialog(savedInstanceState: Bundle?): Dialog {
        val product = arguments?.getSerializable(ARG_PRODUCT) as? Products

        val view = LayoutInflater.from(context).inflate(R.layout.view_by_buyer, null)

        // Match views from view_by_buyer.xml
        val productImage = view.findViewById<ImageView>(R.id.product_image)
        val productName = view.findViewById<TextView>(R.id.product_name)
        val productDescription = view.findViewById<TextView>(R.id.product_description)
        val productPrice = view.findViewById<TextView>(R.id.product_price)
        val sellerPhoto = view.findViewById<ImageView>(R.id.seller_photo)
        val sellerUsername = view.findViewById<TextView>(R.id.seller_username)
        val chatButton = view.findViewById<LinearLayout>(R.id.btnChat)

        chatButton.setOnClickListener {
            val sharedPref = requireContext().getSharedPreferences("CampusCartPrefs", MODE_PRIVATE)
            val currentUserId = sharedPref.getString("loggedInUsername", null) ?: return@setOnClickListener
            val sellerId = product?.userUsername ?: return@setOnClickListener

            val query = GroupChannel.createMyGroupChannelListQuery(
                GroupChannelListQueryParams().apply {
                    userIdsExactFilter = listOf(currentUserId, sellerId)
                    includeEmpty = true
                    limit = 1
                }
            )

            query.next { channels, e ->
                if (e != null) {
                    Log.e("SendBird", "Channel query failed: ${e.message}")
                    return@next
                }

                if (!channels.isNullOrEmpty()) {
                    // Existing channel found
                    val existingChannel = channels[0]
                    goToChatActivity(existingChannel.url, sellerId)
                } else {
                    // No existing channel, create new
                    val params = GroupChannelCreateParams().apply {
                        userIds = listOf(currentUserId, sellerId)
                        isDistinct = true
                    }

                    GroupChannel.createChannel(params) { newChannel, err ->
                        if (err != null) {
                            Log.e("SendBird", "Channel creation failed: ${err.message}")
                        } else {
                            goToChatActivity(newChannel?.url, sellerId)
                        }
                    }
                }
            }
        }

        val likeButton = view.findViewById<LinearLayout>(R.id.btnLike)
        val likeIcon = view.findViewById<ImageView>(R.id.imageLikeIcon)

        product?.let {
            productName.text = it.name
            productDescription.text = it.pdtDescription
            productPrice.text = "₱${String.format("%.2f", it.buyPrice)}"
            sellerUsername.text = it.userUsername ?: "Unknown Seller"

            Picasso.get()
                .load("${Constants.BASE_URL}${it.imagePath}")
                .placeholder(R.drawable.defaultimage)
                .error(R.drawable.defaultimage)
                .into(productImage)

            Picasso.get()
                .load("${Constants.BASE_URL}uploads/${it.userProfileImagePath}")
                .placeholder(R.drawable.defaultphoto)
                .error(R.drawable.defaultphoto)
                .into(sellerPhoto)

            if (likedProducts.contains(it.name)) {
                likeIcon.setImageResource(R.drawable.full_heart)
            } else {
                likeIcon.setImageResource(R.drawable.like)
            }

            product?.let { prod ->
                val isLiked = PreferenceUtils.isProductLiked(requireContext(), prod.name)
                likeIcon.setImageResource(if (isLiked) R.drawable.full_heart else R.drawable.like)

                likeButton.setOnClickListener {
                    val nowLiked = PreferenceUtils.toggleLikedProduct(requireContext(), prod.name)
                    likeIcon.setImageResource(if (nowLiked) R.drawable.full_heart else R.drawable.like)
                }
            }
        }

            val dialog = AlertDialog.Builder(requireContext())
                .setView(view)
                .setCancelable(true)
                .create()

            dialog.setCanceledOnTouchOutside(true)
            dialog.window?.setBackgroundDrawableResource(android.R.color.transparent)
            return dialog
        }

    private fun goToChatActivity(channelUrl: String?, recipientUsername: String) {
        val intent = Intent(requireContext(), ChatActivity::class.java).apply {
            putExtra("channel_url", channelUrl)
            putExtra("otherUserId", recipientUsername)
        }
        startActivity(intent)
    }
}
