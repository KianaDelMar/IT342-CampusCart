package edu.cit.campuscart.fragments

import android.app.AlertDialog
import android.app.Dialog
import android.content.Context
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
import android.util.Log
import android.view.Gravity
import android.widget.ImageButton
import android.widget.Toast
import androidx.appcompat.widget.AppCompatImageButton
import edu.cit.campuscart.forms.EditProductDialogFragment
import edu.cit.campuscart.notifdialogs.DeleteConfirmationDialog
import edu.cit.campuscart.utils.RetrofitClient
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

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

    private lateinit var product: Products

    // Moved and fixed function to take productId
    private fun deleteProduct(productId: Int) {
        val context = requireContext()
        val prefs = context.getSharedPreferences("CampusCartPrefs", Context.MODE_PRIVATE)

        val loggedInUsername = prefs.getString("loggedInUsername", "") ?: ""
        val token = prefs.getString("authToken", "") ?: ""

        if (product.userUsername != loggedInUsername) {
            Toast.makeText(context, "You are not the creator of this product.", Toast.LENGTH_SHORT).show()
            return
        }

        if (token.isEmpty()) {
            Toast.makeText(context, "User not authenticated. Please log in again.", Toast.LENGTH_SHORT).show()
            return
        }

        val bearerToken = "Bearer $token"

        RetrofitClient.instance.deleteProduct(bearerToken, productId)
            .enqueue(object : Callback<Void> {
                override fun onResponse(call: Call<Void>, response: Response<Void>) {
                    if (response.isSuccessful) {
                        showSuccessToast()
                        dismiss()
                    } else {
                        Log.e("DeleteProduct", "Response Code: ${response.code()}")
                        Log.e("DeleteProduct", "Error Body: ${response.errorBody()?.string()}")
                        showFailToast()
                    }
                }

                override fun onFailure(call: Call<Void>, t: Throwable) {
                    Toast.makeText(context, "Network error: ${t.message}", Toast.LENGTH_SHORT).show()
                }
            })
    }

    override fun onCreateDialog(savedInstanceState: Bundle?): Dialog {
        product = arguments?.getSerializable(ARG_PRODUCT) as Products
        val view = LayoutInflater.from(context).inflate(R.layout.view_by_seller, null)

        val productImage = view.findViewById<ImageView>(R.id.product_image)
        val productName = view.findViewById<TextView>(R.id.product_name)
        val productDescription = view.findViewById<TextView>(R.id.product_description)
        val productPrice = view.findViewById<TextView>(R.id.product_price)
        val productStatus = view.findViewById<TextView>(R.id.product_status)
        val productCondition = view.findViewById<TextView>(R.id.product_condition)
        val editButton = view.findViewById<AppCompatImageButton>(R.id.btnEdit)
        val deleteButton = view.findViewById<ImageButton>(R.id.btnDelete)

        product.let {
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
                dismiss() // Close current dialog
                val editDialog = EditProductDialogFragment.newInstance(product)
                editDialog.show(parentFragmentManager, "EditProductDialog")
            }

            deleteButton.setOnClickListener {
                val dialog = DeleteConfirmationDialog {
                    product.code?.let { code -> deleteProduct(code) }
                }
                dialog.show(parentFragmentManager, "DeleteConfirmationDialog")
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

    private fun showSuccessToast() {
        val toastView = layoutInflater.inflate(R.layout.dialog_delete_success, null)
        Toast(requireContext()).apply {
            view = toastView
            duration = Toast.LENGTH_SHORT
            setGravity(Gravity.TOP or Gravity.CENTER_HORIZONTAL, 0, 80)
            show()
        }
    }

    private fun showFailToast() {
        val toastView = layoutInflater.inflate(R.layout.dialog_delete_fail, null)
        Toast(requireContext()).apply {
            view = toastView
            duration = Toast.LENGTH_SHORT
            setGravity(Gravity.TOP or Gravity.CENTER_HORIZONTAL, 0, 80)
            show()
        }
    }
}