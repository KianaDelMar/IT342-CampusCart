package edu.cit.campuscart

import android.app.AlertDialog
import android.app.Dialog
import android.os.Bundle
import android.view.LayoutInflater
import android.widget.ImageView
import android.widget.TextView
import androidx.fragment.app.DialogFragment
import com.squareup.picasso.Picasso
import edu.cit.campuscart.models.Products
import edu.cit.campuscart.utils.Constants

class ProductDetailDialogFragment : DialogFragment() {

    companion object {
        private const val ARG_PRODUCT = "product"

        fun newInstance(product: Products): ProductDetailDialogFragment {
            val fragment = ProductDetailDialogFragment()
            val args = Bundle()
            args.putSerializable(ARG_PRODUCT, product) // Make sure Products implements Serializable
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


        // Optional: you can add seller photo and username if you include them in your layout
        // (Note: These are *not* defined in your current view_by_buyer.xml,
        // but are referenced in your previous fragment code. Add them if needed.)

        product?.let {
            productName.text = it.name
            productDescription.text = it.pdtDescription
            productPrice.text = "₱${String.format("%.2f", it.buyPrice)}"
            sellerUsername.text = it.userUsername ?: "Unknown Seller"

            Picasso.get()
                .load("${Constants.BASE_URL}/${it.imagePath}")
                .placeholder(R.drawable.defaultimage)
                .error(R.drawable.defaultimage)
                .into(productImage)

            Picasso.get()
                .load("${Constants.BASE_URL}/uploads/${it.userProfileImagePath}")
                .placeholder(R.drawable.defaultphoto)
                .error(R.drawable.defaultphoto)
                .into(sellerPhoto)
        }

        val dialog = AlertDialog.Builder(requireContext())
            .setView(view)
            .setCancelable(true) // Allow dialog to be cancelled by tapping outside
            .create()

        dialog.setCanceledOnTouchOutside(true) // Close dialog when tapping outside
        dialog.window?.setBackgroundDrawableResource(android.R.color.transparent)
        return dialog
    }
}
