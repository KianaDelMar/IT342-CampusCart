package edu.cit.campuscart.fragments

import android.app.AlertDialog
import android.app.Dialog
import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity.MODE_PRIVATE
import androidx.fragment.app.DialogFragment
import androidx.lifecycle.lifecycleScope
import com.google.gson.Gson
import com.squareup.picasso.Picasso
import edu.cit.campuscart.R
import edu.cit.campuscart.models.Products
import edu.cit.campuscart.pages.ChatActivity
import edu.cit.campuscart.utils.Constants
import edu.cit.campuscart.utils.PreferenceUtils
import edu.cit.campuscart.utils.RetrofitClient
import kotlinx.coroutines.launch
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.RequestBody.Companion.toRequestBody

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

        val token = requireContext().getSharedPreferences("CampusCartPrefs", MODE_PRIVATE).getString("authToken", "") ?: ""
        val username1 = requireContext()
            .getSharedPreferences("CampusCartPrefs", Context.MODE_PRIVATE)
            .getString("loggedInUsername", "") ?: ""
        val bearerToken = "Bearer $token"

        chatButton.setOnClickListener {
            product?.let {
                val intent = Intent(requireContext(), ChatActivity::class.java).apply {
                    putExtra("recipientUsername", it.userUsername)
                    putExtra("productCode", it.code)
                    putExtra("productName", it.name)
                    putExtra("productImagePath", it.imagePath)
                    putExtra("productPrice", it.buyPrice)
                    putExtra("productDescription", it.pdtDescription)
                }
                startActivity(intent)
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
