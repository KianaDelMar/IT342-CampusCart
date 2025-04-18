package edu.cit.campuscart.pages
import android.os.Bundle
import android.util.Log
import android.widget.Toast
import androidx.recyclerview.widget.GridLayoutManager
import androidx.recyclerview.widget.RecyclerView
import edu.cit.campuscart.BaseActivity
import edu.cit.campuscart.R
import edu.cit.campuscart.models.Products
import edu.cit.campuscart.adapters.ProductAdapters
import edu.cit.campuscart.fragments.SellerProductDetail
import edu.cit.campuscart.utils.RetrofitClient
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class ProfilePage : BaseActivity() {

    private lateinit var recyclerViewProfileProducts: RecyclerView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_profilepage) // Make sure this layout has a RecyclerView with the ID

        recyclerViewProfileProducts = findViewById(R.id.recyclerUserProducts)
        recyclerViewProfileProducts.layoutManager = GridLayoutManager(this, 2)

        val username = getSharedPreferences("CampusCartPrefs", MODE_PRIVATE)
            .getString("loggedInUsername", "") ?: ""

        if (username.isNotEmpty()) {
            loadUserProducts(username)
        } else {
            Toast.makeText(this, "No username found", Toast.LENGTH_SHORT).show()
        }
    }

    private fun loadUserProducts(username: String) {
        val apiService = RetrofitClient.instance
        val token = "Bearer ${
            getSharedPreferences("CampusCartPrefs", MODE_PRIVATE).getString(
                "auth_token",
                ""
            )
        }"

        val call = apiService.getProductsByUser(token, username)
        call.enqueue(object : Callback<List<Products>> {
            override fun onResponse(
                call: Call<List<Products>>,
                response: Response<List<Products>>
            ) {
                if (response.isSuccessful && response.body() != null) {
                    val userProducts = response.body()!! // No filtering
                    // Log the full product details

                    val adapter = ProductAdapters(userProducts.toMutableList()) { selectedProduct ->
                        Log.d("ProfilePage", "Selected Product Category: ${selectedProduct.category}")
                        val dialog = SellerProductDetail.newInstance(selectedProduct)
                        dialog.show(supportFragmentManager, "SellerProductDetail")
                    }

                    recyclerViewProfileProducts.adapter = adapter
                } else {
                    Toast.makeText(
                        this@ProfilePage,
                        "Failed to load your products",
                        Toast.LENGTH_SHORT
                    ).show()
                }
            }

            override fun onFailure(call: Call<List<Products>>, t: Throwable) {
                Toast.makeText(this@ProfilePage, "Network error: ${t.message}", Toast.LENGTH_SHORT)
                    .show()
            }
        })
    }
}