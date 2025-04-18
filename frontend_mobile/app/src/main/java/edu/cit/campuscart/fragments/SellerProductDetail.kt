package edu.cit.campuscart.fragments

import android.app.AlertDialog
import android.app.Dialog
import android.os.Bundle
import android.view.LayoutInflater
import android.widget.ImageView
import android.widget.TextView
import androidx.fragment.app.DialogFragment
import com.squareup.picasso.Picasso
import edu.cit.campuscart.R
import edu.cit.campuscart.models.Products
import edu.cit.campuscart.utils.Constants
import android.graphics.Color
import android.widget.ImageButton
import androidx.appcompat.widget.AppCompatImageButton
import edu.cit.campuscart.forms.EditProductDialogFragment

class SellerProductDetail : DialogFragment() {

    companion object {
        private const val ARG_PRODUCT = "product"

        fun newInstance(product: Products): SellerProductDetail {
            val fragment = SellerProductDetail()
            val args = Bundle()
            args.putSerializable(ARG_PRODUCT, product)
            fragment.arguments = args
            return fragment
        }
    }

    override fun onCreateDialog(savedInstanceState: Bundle?): Dialog {
        val product = arguments?.getSerializable(ARG_PRODUCT) as? Products
        val view = LayoutInflater.from(context).inflate(R.layout.view_by_seller, null)

        val productImage = view.findViewById<ImageView>(R.id.product_image)
        val productName = view.findViewById<TextView>(R.id.product_name)
        val productDescription = view.findViewById<TextView>(R.id.product_description)
        val productPrice = view.findViewById<TextView>(R.id.product_price)
        val productStatus = view.findViewById<TextView>(R.id.product_status)
        val productCondition = view.findViewById<TextView>(R.id.product_condition)
        val editButton = view.findViewById<AppCompatImageButton>(R.id.btnEdit)
        val deleteButton = view.findViewById<ImageButton>(R.id.btnDelete)

        product?.let {
            productName.text = it.name
            productDescription.text = it.pdtDescription
            productPrice.text = "₱${String.format("%.2f", it.buyPrice)}"
            productCondition.text = it.conditionType
            productStatus.text = it.status?.replaceFirstChar { char -> char.uppercase() } ?: "Pending"

            when (it.status?.lowercase()) {
                "approved" -> productStatus.setTextColor(Color.parseColor("#49D349"))
                "pending" -> productStatus.setTextColor(Color.parseColor("#E1A117"))
                else -> productStatus.setTextColor(Color.parseColor("#C4C4C4"))
            }

            Picasso.get()
                .load("${Constants.BASE_URL}/${it.imagePath}")
                .placeholder(R.drawable.defaultimage)
                .error(R.drawable.defaultimage)
                .into(productImage)

            editButton.setOnClickListener {
                dismiss() // Close the current dialog first
                val editDialog = EditProductDialogFragment.newInstance(product)
                editDialog.show(parentFragmentManager, "EditProductDialog")
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
}