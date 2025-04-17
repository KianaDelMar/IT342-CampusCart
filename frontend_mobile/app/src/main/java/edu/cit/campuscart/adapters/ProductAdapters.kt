package edu.cit.campuscart.adapters

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.squareup.picasso.Picasso
import edu.cit.campuscart.R
import edu.cit.campuscart.models.Products
import edu.cit.campuscart.utils.Constants

class ProductAdapters(private val products: List<Products>, private val onItemClick: (Products) -> Unit) : RecyclerView.Adapter<ProductAdapters.ProductViewHolder>() {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ProductViewHolder {
        val view = LayoutInflater.from(parent.context).inflate(R.layout.product_item, parent, false)
        return ProductViewHolder(view)
    }

    override fun onBindViewHolder(holder: ProductViewHolder, position: Int) {
        val product = products[position]
        val seller = product.userUsername

        holder.productName.text = product.name
        val formattedPrice = String.format("%.2f", product.buyPrice)
        holder.productPrice.text = "₱$formattedPrice"
        holder.productDescription.text = product.pdtDescription
        holder.userUsername.text = seller ?: "Unknown Seller"

        // Load product image
        Picasso.get()
            .load("${Constants.BASE_URL}/${product.imagePath}")
            .placeholder(R.drawable.defaultimage)
            .error(R.drawable.defaultimage)
            .into(holder.productImage)

        // Load seller photo
        if (!product.userProfileImagePath.isNullOrBlank()) {
            Picasso.get()
                .load("${Constants.BASE_URL}/uploads/${product.userProfileImagePath}")
                .placeholder(R.drawable.defaultphoto)
                .error(R.drawable.defaultphoto)
                .into(holder.sellerPhoto)
        } else {
            holder.sellerPhoto.setImageResource(R.drawable.defaultphoto)
        }

        // Handle item click
        holder.itemView.setOnClickListener {
            onItemClick(product)
        }
    }

    override fun getItemCount(): Int = products.size
    inner class ProductViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val productName: TextView = view.findViewById(R.id.product_name)
        val productPrice: TextView = view.findViewById(R.id.product_price)
        val productImage: ImageView = view.findViewById(R.id.product_image)
        val sellerPhoto: ImageView = view.findViewById(R.id.seller_photo)
        val productDescription: TextView = view.findViewById(R.id.product_description)
        val userUsername: TextView = view.findViewById(R.id.seller_username)
    }
}